
"use client";

import { useEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useInView,
    useReducedMotion,
} from "framer-motion";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DEFAULT_BIRTHDAY = "2026-12-19T00:00:00+07:00";

function getCountdown(target) {
    const distance = Math.max(0, target - Date.now());

    return {
        total: distance,
        days: Math.floor(distance / DAY),
        hours: Math.floor((distance % DAY) / HOUR),
        minutes: Math.floor((distance % HOUR) / MINUTE),
        seconds: Math.floor((distance % MINUTE) / SECOND),
    };
}

function pad(value) {
    return String(value).padStart(2, "0");
}

const DECORATIONS = [
    { left: "7%", top: "16%", delay: "0s" },
    { left: "18%", top: "73%", delay: "2s" },
    { left: "31%", top: "11%", delay: "4s" },
    { left: "68%", top: "13%", delay: "1s" },
    { left: "85%", top: "74%", delay: "3s" },
    { left: "94%", top: "23%", delay: "5s" },
];

function TimeUnit({ value, label, reducedMotion }) {
    return (
        <div className="birthday-countdown__unit">
            <div className="birthday-countdown__number-box">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={value}
                        className="birthday-countdown__number"
                        initial={
                            reducedMotion
                                ? false
                                : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                            reducedMotion
                                ? { opacity: 1 }
                                : { opacity: 0, y: -8 }
                        }
                        transition={{ duration: 0.18 }}
                    >
                        {pad(value)}
                    </motion.span>
                </AnimatePresence>
            </div>

            <span className="birthday-countdown__unit-label">
                {label}
            </span>
        </div>
    );
}

export default function BirthdayCountdown({
    birthday = DEFAULT_BIRTHDAY,
}) {
    const sectionRef = useRef(null);
    const isVisible = useInView(sectionRef, {
        amount: 0.1,
    });

    const reducedMotion = useReducedMotion();

    const target = Date.parse(birthday);
    const validTarget = Number.isFinite(target);

    const [now, setNow] = useState(null);

    useEffect(() => {
        if (!isVisible || !validTarget) return;

        const update = () => setNow(Date.now());

        // Cập nhật ngay khi đồng hồ bắt đầu chạy.
        // Callback bất đồng bộ tránh cập nhật state
        // trực tiếp trong body của effect.
        const initialTimer = setTimeout(update, 0);

        const interval = setInterval(update, 1000);

        const handleVisibilityChange = () => {
            if (!document.hidden) update();
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [isVisible, validTarget]);

    if (!validTarget) {
        return null;
    }

    const remaining =
        now === null
            ? null
            : {
                total: Math.max(0, target - now),
                days: Math.floor(Math.max(0, target - now) / DAY),
                hours: Math.floor(
                    (Math.max(0, target - now) % DAY) / HOUR
                ),
                minutes: Math.floor(
                    (Math.max(0, target - now) % HOUR) / MINUTE
                ),
                seconds: Math.floor(
                    (Math.max(0, target - now) % MINUTE) / SECOND
                ),
            };

    const isBirthday =
        now !== null &&
        now >= target &&
        now < target + DAY;

    const isPastBirthday =
        now !== null && now >= target + DAY;

    return (
        <section
            ref={sectionRef}
            className={`birthday-countdown ${isVisible ? "is-visible" : ""
                }`}
        >
            <div className="birthday-countdown__ambient" />

            <div className="birthday-countdown__stars" aria-hidden="true">
                {DECORATIONS.map((star, index) => (
                    <span
                        key={index}
                        className="birthday-countdown__star"
                        style={{
                            left: star.left,
                            top: star.top,
                            animationDelay: star.delay,
                        }}
                    >
                        ✦
                    </span>
                ))}
            </div>

            <div className="birthday-countdown__container">
                <motion.div
                    className="birthday-countdown__heading"
                    initial={{
                        opacity: 0,
                        y: 55,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.25,
                    }}
                    transition={{
                        duration: 1.4,
                        delay: 0.2,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <span className="birthday-countdown__eyebrow">
                        A SPECIAL DAY IS COMING
                    </span>

                    <h2>
                        Counting Down
                        <br />
                        <em>to Your Birthday ♡</em>
                    </h2>

                    <p>
                        Mỗi giây trôi qua là một chút gần hơn
                        <br />
                        đến ngày đặc biệt của em.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {remaining === null ? (
                        <motion.div
                            key="loading"
                            className="birthday-countdown__loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            Đang đếm những khoảnh khắc... ✧
                        </motion.div>
                    ) : remaining.total > 0 ? (
                        <motion.div
                            key="counting"
                            className="birthday-countdown__content"
                            initial={{
                                opacity: 0,
                                y: 45,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.5,
                                delay: 0.45,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <div
                                className="birthday-countdown__timer"
                                role="timer"
                                aria-label={`${remaining.days} ngày, ${remaining.hours} giờ, ${remaining.minutes} phút, ${remaining.seconds} giây còn lại`}
                            >
                                <TimeUnit
                                    value={remaining.days}
                                    label="Ngày"
                                    reducedMotion={reducedMotion}
                                />

                                <span className="birthday-countdown__separator">
                                    :
                                </span>

                                <TimeUnit
                                    value={remaining.hours}
                                    label="Giờ"
                                    reducedMotion={reducedMotion}
                                />

                                <span className="birthday-countdown__separator">
                                    :
                                </span>

                                <TimeUnit
                                    value={remaining.minutes}
                                    label="Phút"
                                    reducedMotion={reducedMotion}
                                />

                                <span className="birthday-countdown__separator">
                                    :
                                </span>

                                <TimeUnit
                                    value={remaining.seconds}
                                    label="Giây"
                                    reducedMotion={reducedMotion}
                                />
                            </div>

                            <p className="birthday-countdown__bottom-text">
                                Một chút chờ đợi, một chút háo hức...
                                <br />
                                và thật nhiều điều ngọt ngào đang đến ♡
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="celebration"
                            className="birthday-countdown__celebration"
                            initial={
                                reducedMotion
                                    ? false
                                    : { opacity: 0, scale: 0.92 }
                            }
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7 }}
                        >
                            <motion.div
                                className="birthday-countdown__celebration-icon"
                                animate={
                                    reducedMotion
                                        ? {}
                                        : { scale: [1, 1.12, 1] }
                                }
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                aria-hidden="true"
                            >
                                ♡
                            </motion.div>

                            <h3>
                                {isBirthday
                                    ? "Happy Birthday, My Special Girl!"
                                    : "A Beautiful Birthday Memory ♡"}
                            </h3>

                            <p>
                                {isBirthday
                                    ? "Ngày đặc biệt cuối cùng cũng đến rồi! Chúc em một tuổi mới thật nhiều niềm vui, bình an và những điều tốt đẹp nhất. ♡"
                                    : "Ngày sinh nhật đã qua, nhưng những lời chúc và kỷ niệm đẹp vẫn luôn ở đây. ♡"}
                            </p>

                            <span>✦ 19 · 12 · 2026 ✦</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="birthday-countdown__date">
                    <span>✧</span>
                    <span>19 · 12 · 2026</span>
                    <span>✧</span>
                </div>
            </div>
        </section>
    );
}
