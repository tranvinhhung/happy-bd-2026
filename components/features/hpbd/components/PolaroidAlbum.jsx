
"use client";

import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
} from "framer-motion";

import { polaroidMemories } from "../utils/data/polaroid";

// ======================================================
// Helpers
// ======================================================

const createPositions = (items) =>
    Object.fromEntries(
        items.map((item) => [
            item.id,
            {
                x: item.x ?? 0,
                y: item.y ?? 0,
                rotate: item.rotation ?? 0,
            },
        ])
    );

const INITIAL_POSITIONS = createPositions(polaroidMemories);

const INITIAL_ORDER = polaroidMemories.map((item) => item.id);

const SPRING_CONFIG = {
    type: "spring",
    stiffness: 180,
    damping: 24,
    mass: 0.9,
};

const shuffleArray = (items) => {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
};

// ======================================================
// Polaroid Card
// ======================================================

const PolaroidCard = memo(function PolaroidCard({
    memory,
    position,
    index,
    isFlipped,
    isActive,
    isMobile,
    reduceMotion,
    onActivate,
    onFlip,
    onPositionChange,
    layoutVersion,
}) {
    const scale = isMobile ? 0.58 : 1;

    // MotionValues là nguồn dữ liệu duy nhất
    // điều khiển vị trí kéo của card.
    const x = useMotionValue(position.x * scale);
    const y = useMotionValue(position.y * scale);
    const rotate = useMotionValue(position.rotate);

    const dragStartRef = useRef({ x: 0, y: 0 });
    const animationsRef = useRef([]);

    const stopAnimations = useCallback(() => {
        animationsRef.current.forEach((animation) => {
            animation.stop();
        });

        animationsRef.current = [];
    }, []);

    // Khi reset / shuffle / đổi breakpoint:
    // đưa card về vị trí tương ứng bằng animation.
    useEffect(() => {
        stopAnimations();

        const targetX = position.x * scale;
        const targetY = position.y * scale;
        const targetRotate = position.rotate;

        if (reduceMotion) {
            x.set(targetX);
            y.set(targetY);
            rotate.set(targetRotate);
            return;
        }

        const animationX = animate(x, targetX, SPRING_CONFIG);
        const animationY = animate(y, targetY, SPRING_CONFIG);
        const animationRotate = animate(
            rotate,
            targetRotate,
            SPRING_CONFIG
        );

        animationsRef.current = [
            animationX,
            animationY,
            animationRotate,
        ];

        return stopAnimations;
    }, [
        layoutVersion,
        scale,
        position.x,
        position.y,
        position.rotate,
        reduceMotion,
        x,
        y,
        rotate,
        stopAnimations,
    ]);

    const handleDragStart = () => {
        stopAnimations();

        dragStartRef.current = {
            x: x.get(),
            y: y.get(),
        };

        onActivate();
    };

    const handleDragEnd = () => {
        // Lấy trực tiếp tọa độ thực tế sau drag.
        // Không cộng info.offset để tránh sai lệch.
        const nextPosition = {
            x: x.get() / scale,
            y: y.get() / scale,
            rotate: rotate.get(),
        };

        onPositionChange(memory.id, nextPosition);
    };

    return (
        <motion.div
            className={`polaroid-album__card ${isActive ? "is-active" : ""
                }`}
            style={{
                zIndex: index,
                x,
                y,
                rotate,
                scale,
                touchAction: "none",
            }}
            drag={!isFlipped}
            dragMomentum={false}
            dragElastic={0.12}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onPointerDown={onActivate}
            whileDrag={{
                scale: scale * 1.06,
                cursor: "grabbing",
            }}
        >
            <motion.div
                className="polaroid-album__card-inner"
                animate={{
                    rotateY: isFlipped ? 180 : 0,
                }}
                transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                {/* FRONT */}
                <div className="polaroid-album__front">
                    <div className="polaroid-album__photo">
                        <img
                            src={memory.image}
                            alt={memory.title}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                        />
                    </div>

                    <div className="polaroid-album__caption">
                        <span>{memory.title}</span>

                        <button
                            type="button"
                            className="polaroid-album__flip-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onFlip(memory.id);
                            }}
                            aria-label={`Lật ảnh ${memory.title}`}
                        >
                            ↻
                        </button>
                    </div>
                </div>

                {/* BACK */}
                <div className="polaroid-album__back">
                    <span className="polaroid-album__back-heart">
                        ♡
                    </span>

                    <span className="polaroid-album__back-date">
                        {memory.date}
                    </span>

                    <p>{memory.message}</p>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onFlip(memory.id);
                        }}
                    >
                        Xem lại ảnh ↻
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
});

// ======================================================
// Main Album
// ======================================================

export default function PolaroidAlbum() {
    const reduceMotion = useReducedMotion();

    const [positions, setPositions] = useState(
        INITIAL_POSITIONS
    );

    const [order, setOrder] = useState(INITIAL_ORDER);

    const [flippedIds, setFlippedIds] = useState([]);

    const [isMobile, setIsMobile] = useState(false);

    // Mỗi lần reset hoặc shuffle sẽ tăng version.
    // Nhờ vậy, reset vẫn chạy kể cả khi tọa độ
    // trong state không thay đổi.
    const [layoutVersion, setLayoutVersion] = useState(0);

    // ==================================================
    // Responsive
    // ==================================================

    useEffect(() => {
        const media = window.matchMedia("(max-width: 600px)");

        const update = () => {
            setIsMobile(media.matches);
        };

        media.addEventListener("change", update);

        return () => {
            media.removeEventListener("change", update);
        };
    }, []);

    // ==================================================
    // Actions
    // ==================================================

    const activateCard = useCallback((id) => {
        setOrder((current) => {
            if (current[current.length - 1] === id) {
                return current;
            }

            return [
                ...current.filter((item) => item !== id),
                id,
            ];
        });
    }, []);

    const flipCard = useCallback(
        (id) => {
            activateCard(id);

            setFlippedIds((current) =>
                current.includes(id)
                    ? current.filter((item) => item !== id)
                    : [...current, id]
            );
        },
        [activateCard]
    );

    const updatePosition = useCallback((id, nextPosition) => {
        setPositions((current) => ({
            ...current,
            [id]: nextPosition,
        }));
    }, []);

    const shuffleCards = useCallback(() => {
        setFlippedIds([]);

        // Xáo trộn các vị trí gốc thay vì vị trí
        // đã kéo, để không bị trôi ra ngoài album.
        const shuffledPositions = shuffleArray(
            polaroidMemories.map((item) => ({
                ...INITIAL_POSITIONS[item.id],
            }))
        );

        const nextPositions = Object.fromEntries(
            polaroidMemories.map((item, index) => [
                item.id,
                shuffledPositions[index],
            ])
        );

        setPositions(nextPositions);
        setLayoutVersion((current) => current + 1);
    }, []);

    const resetCards = useCallback(() => {
        setPositions(createPositions(polaroidMemories));
        setFlippedIds([]);
        setOrder([...INITIAL_ORDER]);

        // Bắt buộc animation chạy lại,
        // kể cả khi position không đổi.
        setLayoutVersion((current) => current + 1);
    }, []);

    // ==================================================
    // Render
    // ==================================================

    return (
        <section className="polaroid-album">
            <motion.div
                className="polaroid-album__heading"
                initial={
                    reduceMotion
                        ? false
                        : { opacity: 0, y: 25 }
                }
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    amount: 0.3,
                }}
                transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                <span className="polaroid-album__eyebrow">
                    OUR LITTLE MEMORIES
                </span>

                <h2>
                    Những mảnh ghép
                    <br />
                    <em>kỷ niệm ♡</em>
                </h2>

                <p>
                    Mỗi tấm ảnh là một câu chuyện nhỏ.
                    <br />
                    Chạm, kéo và lật ảnh để khám phá nhé!
                </p>
            </motion.div>

            <div className="polaroid-album__workspace">
                <div className="polaroid-album__decoration polaroid-album__decoration--one">
                    ✦
                </div>

                <div className="polaroid-album__decoration polaroid-album__decoration--two">
                    ♡
                </div>

                <div className="polaroid-album__stage">
                    {polaroidMemories.map((memory) => (
                        <PolaroidCard
                            key={memory.id}
                            memory={memory}
                            position={positions[memory.id]}
                            index={
                                order.indexOf(memory.id) + 1
                            }
                            isFlipped={flippedIds.includes(
                                memory.id
                            )}
                            isActive={
                                order[order.length - 1] ===
                                memory.id
                            }
                            isMobile={isMobile}
                            reduceMotion={reduceMotion}
                            onActivate={() =>
                                activateCard(memory.id)
                            }
                            onFlip={flipCard}
                            onPositionChange={updatePosition}
                            layoutVersion={layoutVersion}
                        />
                    ))}
                </div>
            </div>

            <div className="polaroid-album__actions">
                <button
                    type="button"
                    onClick={shuffleCards}
                >
                    <span>✧</span> Xáo trộn ảnh
                </button>

                <button
                    type="button"
                    onClick={resetCards}
                >
                    <span>↻</span> Sắp xếp lại
                </button>
            </div>

            <p className="polaroid-album__footer">
                Five little moments, a thousand beautiful
                memories ♡
            </p>
        </section>
    );
}
