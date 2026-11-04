
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
    AnimatePresence,
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
    onOpen,
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
    const photoTouchRef = useRef({
        lastTapAt: 0,
        startX: 0,
        startY: 0,
    });
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

    const handlePhotoTouchStart = (event) => {
        const touch = event.changedTouches[0];

        photoTouchRef.current.startX = touch.clientX;
        photoTouchRef.current.startY = touch.clientY;
    };

    const handlePhotoTouchEnd = (event) => {
        const touch = event.changedTouches[0];
        const touchState = photoTouchRef.current;
        const movedDistance = Math.hypot(
            touch.clientX - touchState.startX,
            touch.clientY - touchState.startY,
        );
        const now = Date.now();

        if (movedDistance > 24) {
            touchState.lastTapAt = 0;
            return;
        }

        if (now - touchState.lastTapAt <= 350) {
            event.stopPropagation();
            touchState.lastTapAt = 0;
            onOpen(memory);
            return;
        }

        touchState.lastTapAt = now;
    };

    return (
        <motion.div
            className={`polaroid-album__card ${isActive ? "is-active" : ""
                }`}
            initial={
                reduceMotion
                    ? false
                    : {
                          opacity: 0,
                          filter: "blur(5px)",
                          scale: scale * 0.82,
                      }
            }
            whileInView={
                reduceMotion
                    ? undefined
                    : {
                          opacity: 1,
                          filter: "blur(0px)",
                          scale,
                      }
            }
            viewport={{
                once: true,
                amount: 0.2,
                margin: "0px 0px -10% 0px",
            }}
            transition={{
                opacity: {
                    duration: 0.9,
                    delay: index * 0.14,
                },
                filter: {
                    duration: 0.9,
                    delay: index * 0.14,
                },
                scale: {
                    duration: 1.1,
                    delay: index * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                },
            }}
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
                    <button
                        type="button"
                        className="polaroid-album__photo"
                        onDoubleClick={(event) => {
                            event.stopPropagation();
                            onOpen(memory);
                        }}
                        onTouchStart={handlePhotoTouchStart}
                        onTouchEnd={handlePhotoTouchEnd}
                        aria-label={`Nhấp đúp để xem lớn ảnh ${memory.title}`}
                    >
                        <img
                            src={memory.image}
                            alt={memory.title}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                        />
                    </button>

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

export default function PolaroidAlbum({ onMemoryAudioChange }) {
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
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef(null);

    // ==================================================
    // Responsive
    // ==================================================

    useEffect(() => {
        const media = window.matchMedia("(max-width: 600px)");

        const update = () => {
            setIsMobile(media.matches);
        };

        // Cập nhật ngay khi component mount
        update();

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

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
            onMemoryAudioChange?.(false);
        };
    }, [onMemoryAudioChange]);

    const openMemory = useCallback((memory) => {
        setSelectedMemory(memory);
        setIsAudioPlaying(false);
        audioRef.current?.pause();
        audioRef.current?.load();
        onMemoryAudioChange?.(false);
    }, [onMemoryAudioChange]);

    const closeMemory = useCallback(() => {
        audioRef.current?.pause();
        setIsAudioPlaying(false);
        setSelectedMemory(null);
        onMemoryAudioChange?.(false);
    }, [onMemoryAudioChange]);

    const toggleMemoryAudio = async () => {
        if (!audioRef.current) return;

        if (isAudioPlaying) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
            onMemoryAudioChange?.(false);
            return;
        }

        try {
            await audioRef.current.play();
            setIsAudioPlaying(true);
            onMemoryAudioChange?.(true);
        } catch (error) {
            console.warn("Không thể phát âm thanh kỷ niệm:", error);
        }
    };

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
                            onOpen={openMemory}
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

            <AnimatePresence>
                {selectedMemory && (
                    <motion.div
                        className="polaroid-album__lightbox"
                        role="presentation"
                        onClick={closeMemory}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                    <motion.div
                        className="polaroid-album__lightbox-content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="memory-title"
                        onClick={(event) => event.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.86, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <button
                            type="button"
                            className="polaroid-album__lightbox-close"
                            onClick={closeMemory}
                            aria-label="Đóng ảnh"
                        >
                            ×
                        </button>
                        <motion.div
                            className="polaroid-album__lightbox-photo"
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          scale: 1.14,
                                          filter: "blur(10px)",
                                      }
                            }
                            animate={{
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                            }}
                            transition={{
                                duration: 1.15,
                                delay: 0.12,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <motion.span
                                className="polaroid-album__lightbox-photo-shine"
                                initial={
                                    reduceMotion
                                        ? false
                                        : { x: "-120%", opacity: 0 }
                                }
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : { x: "120%", opacity: [0, 0.8, 0] }
                                }
                                transition={{
                                    duration: 1.3,
                                    delay: 0.45,
                                    ease: "easeInOut",
                                }}
                            />
                            <img
                            src={selectedMemory.image}
                            alt={selectedMemory.title}
                            />
                        </motion.div>
                        <div className="polaroid-album__lightbox-info">
                            <span>{selectedMemory.date}</span>
                            <motion.h3
                                id="memory-title"
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, y: 28 }
                                }
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {selectedMemory.title}
                            </motion.h3>
                            <motion.small
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, x: -28 }
                                }
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.78,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {selectedMemory.location}
                            </motion.small>
                            <motion.p
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, y: 24 }
                                }
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.55,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {selectedMemory.message}
                            </motion.p>
                            <motion.button
                                type="button"
                                className="polaroid-album__audio-button"
                                onClick={toggleMemoryAudio}
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, scale: 0.7, y: 18 }
                                }
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : {
                                              opacity: 1,
                                              scale: [0.7, 1.12, 0.92, 1.04, 1],
                                              y: [18, -8, 3, -2, 0],
                                          }
                                }
                                transition={{
                                    duration: 1.05,
                                    delay: 1.05,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {isAudioPlaying
                                    ? "Tạm dừng âm thanh ♫"
                                    : "Nghe âm thanh kỷ niệm ♫"}
                            </motion.button>
                            <audio
                                ref={audioRef}
                                src={selectedMemory.audio || "/audio/beautiful_in_white.mp3"}
                                loop={false}
                                preload="auto"
                                controls={false}
                                autoPlay={isAudioPlaying}
                                onEnded={() => setIsAudioPlaying(false)}
                            />
                        </div>
                    </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
