
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useInView
} from "framer-motion";

const MAX_WISH_LENGTH = 200;
const MAX_VISIBLE_WISHES = 12;
const FLY_DURATION = 1.35;
const MAX_WISHES = 3;

const STAR_POSITIONS = [
    { x: 16, y: 24 },
    { x: 72, y: 20 },
    { x: 42, y: 35 },
    { x: 84, y: 48 },
    { x: 24, y: 58 },
    { x: 60, y: 64 },
    { x: 12, y: 78 },
    { x: 78, y: 82 },
    { x: 48, y: 15 },
    { x: 35, y: 83 },
    { x: 89, y: 29 },
    { x: 54, y: 48 },
];

const DECORATIVE_STARS = [
    { x: 8, y: 12, size: 2 },
    { x: 22, y: 18, size: 3 },
    { x: 36, y: 9, size: 2 },
    { x: 55, y: 13, size: 3 },
    { x: 79, y: 11, size: 2 },
    { x: 91, y: 18, size: 3 },
    { x: 13, y: 43, size: 2 },
    { x: 32, y: 46, size: 3 },
    { x: 67, y: 39, size: 2 },
    { x: 93, y: 66, size: 2 },
    { x: 7, y: 89, size: 3 },
    { x: 47, y: 93, size: 2 },
    { x: 69, y: 91, size: 3 },
    { x: 86, y: 73, size: 2 },
];

const formatDate = (timestamp) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(timestamp));

export default function MakeAWish() {
    const reduceMotion = useReducedMotion();

    const skyRef = useRef(null);
    const timerRef = useRef(null);
    const mountedRef = useRef(true);
    const isSkyVisible = useInView(skyRef, {
        amount: 0.1,
    });

    const [wishes, setWishes] = useState([]);
    const [input, setInput] = useState("");
    const [selectedWish, setSelectedWish] = useState(null);
    const [flyingWish, setFlyingWish] = useState(null);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [adminSecret, setAdminSecret] = useState("");

    const isShowDeleteButton =
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

    const isWishLimitReached = wishes.length >= MAX_WISHES;

    useEffect(() => {
        mountedRef.current = true;

        const controller = new AbortController();

        const fetchWishes = async () => {
            try {
                const response = await fetch("/api/wishes", {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(
                        result.message || "Không thể tải điều ước."
                    );
                }

                const result = await response.json();

                if (controller.signal.aborted) return;

                setWishes(
                    Array.isArray(result.wishes) ? result.wishes : []
                );
                setError("");
            } catch (err) {
                if (controller.signal.aborted) return;

                setError(err.message || "Không thể tải điều ước.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchWishes();

        return () => {
            mountedRef.current = false;
            controller.abort();

            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [reloadKey]);


    const completeWish = useCallback((wish) => {
        if (!mountedRef.current) return;

        setWishes((current) => {
            if (current.some((item) => item.id === wish.id)) {
                return current;
            }

            return [...current, wish].slice(-MAX_VISIBLE_WISHES);
        });

        setFlyingWish(null);
        setSelectedWish(wish);
        setInput("");
        setSending(false);
    }, []);

    const handleSend = async (event) => {
        event.preventDefault();
        const message = input.trim();

        if (
            !message ||
            message.length > MAX_WISH_LENGTH ||
            sending ||
            loading ||
            isWishLimitReached
        ) {
            return;
        }

        setSending(true);
        setError("");
        setSelectedWish(null);

        try {
            const response = await fetch("/api/wishes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Không thể gửi điều ước."
                );
            }

            if (!mountedRef.current) return;

            const wish = result.wish;

            if (reduceMotion) {
                completeWish(wish);
                return;
            }

            setFlyingWish({
                ...wish,
                positionIndex:
                    Math.min(wishes.length, MAX_VISIBLE_WISHES - 1),
            });

            timerRef.current = setTimeout(() => {
                completeWish(wish);
                timerRef.current = null;
            }, FLY_DURATION * 1000);
        } catch (err) {
            if (!mountedRef.current) return;

            setError(err.message || "Đã xảy ra lỗi.");
            setSending(false);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError("");
        setReloadKey((current) => current + 1);
    };


    const handleDeleteWish = async () => {
        if (!selectedWish || deleting) return;

        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn xóa điều ước này không?"
        );

        if (!confirmed) return;

        setDeleting(true);
        setError("");

        try {
            const response = await fetch(
                `/api/wishes/${encodeURIComponent(selectedWish.id)}`,
                {
                    method: "DELETE",
                    headers: {
                        "x-admin-secret": adminSecret,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Không thể xóa điều ước."
                );
            }

            setWishes((current) =>
                current.filter((wish) => wish.id !== selectedWish.id)
            );

            setSelectedWish(null);
            setAdminSecret("");
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi xóa.");
        } finally {
            setDeleting(false);
        }
    };


    const targetPosition = flyingWish
        ? STAR_POSITIONS[flyingWish.positionIndex]
        : null;

    return (
        <section className="make-wish">
            <div className="make-wish__background" />

            <div className="make-wish__container">
                <motion.div
                    className="make-wish__heading"
                    initial={
                        reduceMotion ? false : { opacity: 0, y: 24 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.65 }}
                >
                    <span className="make-wish__eyebrow">
                        MAKE A LITTLE WISH
                    </span>

                    <h2>
                        Gửi một điều ước
                        <br />
                        <em>lên những vì sao ♡</em>
                    </h2>

                    <p>
                        Hãy nghĩ về một điều em thật sự mong muốn.
                        <br />
                        Rồi gửi điều ước ấy lên bầu trời em nhé!
                    </p>
                </motion.div>

                <div
                    className={`make-wish__sky ${isSkyVisible ? "is-visible" : ""
                        }`}
                    ref={skyRef}
                    aria-label="Bầu trời những ngôi sao điều ước"
                >
                    <div className="make-wish__moon" aria-hidden="true">
                        ☾
                    </div>

                    {DECORATIVE_STARS.map((star, index) => (
                        <span
                            key={index}
                            className="make-wish__decorative-star"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: star.size,
                                height: star.size,
                                "--twinkle-duration": `${7 + (index % 4) * 2}s`,
                                "--twinkle-delay": `${(index * 1.7) % 9}s`,
                            }}
                            aria-hidden="true"
                        />
                    ))}

                    {wishes.map((wish, index) => {
                        const position =
                            STAR_POSITIONS[index % STAR_POSITIONS.length];

                        return (
                            <motion.button
                                key={wish.id}
                                type="button"
                                className="make-wish__wish-star"
                                style={{
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                }}
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, scale: 0.3 }
                                }
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                onClick={() => setSelectedWish(wish)}
                                aria-label={`Xem điều ước ngày ${formatDate(
                                    wish.createdAt
                                )}`}
                            >
                                <span
                                    className="make-wish__star-glow"
                                    style={{
                                        "--twinkle-duration": `${5 + (index % 3) * 2}s`,
                                        "--twinkle-delay": `${(index * 2.3) % 7}s`,
                                    }}
                                >
                                    ✦
                                </span>
                            </motion.button>
                        );
                    })}

                    <AnimatePresence>
                        {flyingWish && targetPosition && (
                            <motion.div
                                key={flyingWish.id}
                                className="make-wish__flying-star"
                                style={{
                                    left: `${targetPosition.x}%`,
                                    top: `${targetPosition.y}%`,
                                }}
                                initial={{
                                    opacity: 0,
                                    y: 180,
                                    scale: 0.4,
                                }}
                                animate={{
                                    opacity: [0, 1, 1],
                                    y: 0,
                                    scale: [0.4, 1.4, 1],
                                    rotate: [0, 40, 120],
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: FLY_DURATION,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                aria-hidden="true"
                            >
                                ✦
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!loading &&
                        wishes.length === 0 &&
                        !flyingWish && (
                            <div className="make-wish__empty">
                                <span>✧</span>
                                <p>
                                    Ngôi sao đầu tiên đang chờ điều ước của em...
                                </p>
                            </div>
                        )}

                    {loading && (
                        <div className="make-wish__empty" role="status">
                            <span>✧</span>
                            <p>Đang tìm những ngôi sao...</p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {selectedWish && (
                            <motion.div
                                key={selectedWish.id}
                                className="make-wish__wish-detail"
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, y: 15, scale: 0.96 }
                                }
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.25 }}
                                role="status"
                            >
                                <button
                                    type="button"
                                    className="make-wish__close"
                                    onClick={() => setSelectedWish(null)}
                                    aria-label="Đóng điều ước"
                                >
                                    ×
                                </button>

                                <span className="make-wish__detail-icon">
                                    ✦
                                </span>

                                <p>{selectedWish.text}</p>

                                <small>
                                    {formatDate(selectedWish.createdAt)}
                                </small>
                                {isShowDeleteButton && (
                                    <div className="make-wish__delete-area">
                                        <input
                                            type="password"
                                            value={adminSecret}
                                            onChange={(event) => setAdminSecret(event.target.value)}
                                            placeholder="Mật khẩu quản trị"
                                            autoComplete="off"
                                            aria-label="Mật khẩu quản trị"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleDeleteWish}
                                            disabled={deleting || !adminSecret.trim()}
                                        >
                                            {deleting ? "Đang xóa..." : "Xóa điều ước"}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>


                <AnimatePresence mode="wait">
                    {isWishLimitReached ? (
                        <motion.div
                            key="wish-completed"
                            className="make-wish__card make-wish__completed"
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.span
                                className="make-wish__completed-icon"
                                animate={
                                    reduceMotion
                                        ? {}
                                        : { rotate: [0, -8, 8, 0] }
                                }
                                transition={{ duration: 1.2 }}
                            >
                                ♡
                            </motion.span>

                            <h3>Đủ 3 điều ước rồi nè!</h3>

                            <p>
                                Ước 3 điều thôi em
                                <br />
                                đừng tham lam quá nha hihi ♡
                            </p>

                            <span className="make-wish__completed-note">
                                Ba điều ước nhỏ đã được gửi lên những vì sao ✦
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="wish-form"
                            className="make-wish__card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                        >
                            <span className="make-wish__card-icon">♡</span>

                            <h3>Điều ước của em là gì?</h3>

                            <form onSubmit={handleSend}>
                                <textarea
                                    value={input}
                                    onChange={(event) =>
                                        setInput(
                                            event.target.value.slice(0, MAX_WISH_LENGTH)
                                        )
                                    }
                                    placeholder="Em ước rằng..."
                                    maxLength={MAX_WISH_LENGTH}
                                    rows={4}
                                    disabled={sending || loading}
                                    aria-label="Nhập điều ước của em"
                                />

                                <div className="make-wish__form-bottom">
                                    <span>
                                        {input.length}/{MAX_WISH_LENGTH}
                                    </span>

                                    <button
                                        type="submit"
                                        disabled={
                                            !input.trim() ||
                                            sending ||
                                            loading ||
                                            isWishLimitReached
                                        }
                                    >
                                        {sending
                                            ? "Đang gửi điều ước..."
                                            : "Gửi lên bầu trời ✦"}
                                    </button>
                                </div>
                            </form>

                            <p className="make-wish__hint">
                                Em còn {MAX_WISHES - wishes.length} điều ước nữa đó ♡
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>


                {error && (
                    <div className="make-wish__error" role="alert">
                        <p>{error}</p>
                        {wishes.length === 0 && !sending && (
                            <button
                                type="button"
                                onClick={handleRetry}
                            >
                                Thử tải lại
                            </button>
                        )}
                    </div>
                )}

                <div className="make-wish__footer">
                    <span>
                        {wishes.length}/3 điều ước đã được gửi lên bầu trời ✦
                    </span>
                </div>
            </div>
        </section>
    );
}
