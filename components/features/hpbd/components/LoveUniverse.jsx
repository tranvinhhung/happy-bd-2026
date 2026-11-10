"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import usePopupImagePreload from "../hooks/usePopupImagePreload";
import useAmbientMotion from "../hooks/useAmbientMotion";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useInView,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Sparkles, X } from "lucide-react";
import Reveal from "./Reveal.jsx";
import SectionTitle from "./SectionTitle.jsx";
import styles from "../styles/LoveUniverse.module.scss";

const POPUP_IMAGE = {
    width: 860,
    height: 645,
    sizes: "(max-width: 600px) 90vw, 430px",
};

const DEFAULT_MEMORIES = [
    {
        id: 1,
        x: 12,
        y: 15,
        rotate: -7,
        date: "13.10.2023",
        title: "Những buổi hẹn đầu tiên",
        caption: "Những buổi hẹn đầu tiên ♡",
        message:
            "Giữa hàng triệu người trên thế giới, thật may mắn vì chúng mình đã gặp nhau. Khoảnh khắc ấy là khởi đầu của những điều đẹp đẽ nhất.",
        image: "/images/memories/memory-1.jpg",
    },
    {
        id: 2,
        x: 27,
        y: 45,
        rotate: -8,
        date: "19.12.2023",
        title: "Buổi sinh nhật đầu tiên cho em",
        caption: "Buổi sinh nhật đầu tiên cho em ♡",
        message:
            "Anh vẫn nhớ cảm giác hồi hộp hôm ấy, những câu chuyện nhỏ và nụ cười khiến anh muốn thời gian trôi chậm lại.",
        image: "/images/memories/memory-2.jpg",
    },
    {
        id: 3,
        x: 45,
        y: 10,
        rotate: -10,
        date: "07.03.2024",
        title: "Chuyến đi Đà Lạt đầu tiên",
        caption: "Chuyến đi Đà Lạt đầu tiên ♡",
        message:
            "Điều anh nhớ nhất không phải là phong cảnh, mà là người đã cùng anh ngắm nhìn tất cả.",
        image: "/images/memories/memory-3.jpg",
    },
    {
        id: 4,
        x: 51,
        y: 50,
        rotate: 9,
        date: "18.07.2024",
        title: "Những ngày bên nhau ở Sài Gòn",
        caption: "Những ngày bên nhau ở Sài Gòn ♡",
        message:
            "Chẳng cần điều gì quá đặc biệt. Chỉ cần ở cạnh em, một ngày bình thường cũng trở thành kỷ niệm.",
        image: "/images/memories/memory-4.jpg",
    },
    {
        id: 6,
        x: 75,
        y: 20,
        rotate: 7,
        date: "24.01.2026",
        title: "Cùng nhau trưởng thành",
        caption: "Cùng nhau trưởng thành ♡",
        message:
            "Trải qua thời gian thật dài , gần hơn 1 năm, em đã về bên anh , và anh biết ơn vì điều đó . Cảm ơn em vì đã ở đây, cùng anh đi qua những ngày vui và cả những ngày không dễ dàng.(Cùng em đi đà lạt lần 2)",
        image: "/images/memories/memory-5.jpg",
    },
    {
        id: 7,
        x: 75,
        y: 63,
        rotate: -12,
        date: "02.03.2026",
        title: "Và còn nữa...",
        caption: "Và còn nữa... ♡",
        message:
            "Chuyện của chúng mình vẫn đang được viết tiếp. Anh mong những trang sau sẽ luôn có em. (Dh cùng em đi chơi hà hội để e về Úc nè)",
        image: "/images/memories/memory-6.jpg",
    },
];

const memoryVariants = {
    hidden: {
        opacity: 0,
        y: 65,
        scale: 0.94,
    },
    visible: ({ index, compact }) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: compact ? 0.25 + (index % 2) * 0.22 : 0.35 + index * 0.17,
            duration: compact ? 1.15 : 0.85,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

function random(min, max) {
    return min + Math.random() * (max - min);
}

function createStars(count) {
    return Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        radius: random(0.35, 1.55),
        opacity: random(0.25, 0.9),
        phase: random(0, Math.PI * 2),
        speed: random(0.4, 1.3),
    }));
}

function glow(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255, 140, 190, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}
 
function UniverseCanvas({ memories, finale, revealComplete, layoutRef }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const starsRef = useRef([]);
    const memoryPointsRef = useRef([]);
    const visibleRef = useRef(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Cache the static sky; only stars and connections change each frame.
        const skyCanvas = document.createElement("canvas");
        const skyCtx = skyCanvas.getContext("2d");
        if (!skyCtx) return;

        let width = 0;
        let height = 0;
        let frame = 0;
        let lastFrame = 0;
        let running = false;
        let shootingStar = null;
        let layoutTimer = null;

        const measureMemoryPoints = () => {
            const layoutRect = layoutRef?.current?.getBoundingClientRect();
            memoryPointsRef.current = memories.map((memory, index) => {
                const element =
                    layoutRef?.current?.querySelector(
                        `[data-memory-index="${index}"]`,
                    );

                if (!element || !layoutRect) {
                    return {
                        x: (memory.x / 100) * width,
                        y: (memory.y / 100) * height,
                    };
                }

                const rect = element.getBoundingClientRect();

                return {
                    x: rect.left - layoutRect.left + rect.width / 2,
                    y: Math.max(12, rect.top - layoutRect.top - 14),
                };
            });
        };

        const resize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

            width = rect.width;
            height = rect.height;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            skyCanvas.width = canvas.width;
            skyCanvas.height = canvas.height;
            skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            paintSky();

            starsRef.current = createStars(width < 600 ? 110 : 220);
            measureMemoryPoints();

            window.clearTimeout(layoutTimer);
            layoutTimer = window.setTimeout(measureMemoryPoints, 2200);

            draw(performance.now());
        };

        const paintSky = () => {
            const sky = skyCtx.createLinearGradient(0, 0, 0, height);

            sky.addColorStop(0, "#070b20");
            sky.addColorStop(0.45, "#17102d");
            sky.addColorStop(0.8, "#43213e");
            sky.addColorStop(1, "#9d4b62");

            skyCtx.fillStyle = sky;
            skyCtx.fillRect(0, 0, width, height);

            // Tinh vân màu hồng, tím.
            glow(
                skyCtx,
                width * 0.44,
                height * 0.37,
                width * 0.35,
                "rgba(230, 79, 145, 0.17)",
            );

            glow(
                skyCtx,
                width * 0.77,
                height * 0.23,
                width * 0.33,
                "rgba(113, 86, 213, 0.18)",
            );

            glow(
                skyCtx,
                width * 0.15,
                height * 0.72,
                width * 0.45,
                "rgba(231, 91, 153, 0.13)",
            );
        };

        const draw = (time) => {
            if (!width || !height) return;

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(skyCanvas, 0, 0, width, height);

            // Các ngôi sao nhỏ.
            for (const star of starsRef.current) {
                const twinkle = reduceMotion
                    ? 1
                    : 0.76 + Math.sin(time * 0.001 * star.speed + star.phase) * 0.24;

                ctx.globalAlpha = star.opacity * twinkle;
                ctx.fillStyle = "#fff0f8";

                ctx.beginPath();
                ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;

            // Những đường nối kỷ niệm.
            ctx.save();
            ctx.lineWidth = finale ? 2.2 : 1.2;
            ctx.strokeStyle = finale
                ? "rgba(255, 191, 225, 0.9)"
                : "rgba(255, 188, 216, 0.35)";
            ctx.setLineDash(finale ? [] : [3, 8]);

            const visibleConnections = revealComplete ? memories.length - 1 : 0;

            for (let i = 0; i < visibleConnections; i++) {
                const from = memoryPointsRef.current[i];
                const to = memoryPointsRef.current[i + 1];

                const x1 = from.x;
                const y1 = from.y;
                const x2 = to.x;
                const y2 = to.y;

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2 - 40;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.quadraticCurveTo(midX, midY, x2, y2);
                ctx.stroke();
            }

            ctx.restore();

            // Ánh sáng tại các điểm kỷ niệm.
            memoryPointsRef.current.forEach((point, index) => {
                const x = point.x;
                const y = point.y;

                const pulse = reduceMotion
                    ? 1
                    : 1 + Math.sin(time * 0.002 + index) * 0.12;

                glow(ctx, x, y, 33 * pulse, "rgba(255, 154, 207, 0.35)");

                ctx.fillStyle = "#ffe0ee";
                ctx.beginPath();
                ctx.arc(x, y, 3.5 * pulse, 0, Math.PI * 2);
                ctx.fill();
            });

            // Sao băng nhẹ.
            if (!reduceMotion) {
                if (!shootingStar && Math.random() < 0.003) {
                    shootingStar = {
                        x: random(width * 0.2, width * 0.9),
                        y: random(0, height * 0.3),
                        progress: 0,
                    };
                }

                if (shootingStar) {
                    const x = shootingStar.x - shootingStar.progress * 160;
                    const y = shootingStar.y + shootingStar.progress * 75;

                    const trail = ctx.createLinearGradient(x, y, x + 80, y - 40);

                    trail.addColorStop(0, "rgba(255,255,255,0.9)");
                    trail.addColorStop(1, "rgba(255,255,255,0)");

                    ctx.strokeStyle = trail;
                    ctx.lineWidth = 1.7;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + 80, y - 40);
                    ctx.stroke();

                    shootingStar.progress += 0.025;

                    if (shootingStar.progress > 1) {
                        shootingStar = null;
                    }
                }
            }
        };

        const tick = (time) => {
            if (!running) return;

            if (time - lastFrame >= 1000 / 30) {
                draw(time);
                lastFrame = time;
            }

            frame = requestAnimationFrame(tick);
        };

        const start = () => {
            if (running) return;
            running = true;
            frame = requestAnimationFrame(tick);
        };

        const stop = () => {
            running = false;
            cancelAnimationFrame(frame);
        };

        const syncAnimation = () => {
            if (
                visibleRef.current &&
                document.visibilityState === "visible" &&
                !reduceMotion
            ) {
                start();
            } else {
                stop();
                draw(performance.now());
            }
        };

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                visibleRef.current = entry.isIntersecting;
                syncAnimation();
            },
            { threshold: 0.05 },
        );

        const resizeObserver = new ResizeObserver(resize);

        resizeObserver.observe(container);
        intersectionObserver.observe(container);

        document.addEventListener("visibilitychange", syncAnimation);

        resize();
        syncAnimation();

        return () => {
            stop();
            window.clearTimeout(layoutTimer);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();

            document.removeEventListener("visibilitychange", syncAnimation);
        };
    }, [layoutRef, memories, finale, reduceMotion, revealComplete]);

    return (
        <div ref={containerRef} className={styles.canvasLayer}>
            <canvas ref={canvasRef} aria-hidden="true" />
        </div>
    );
}

export default function LoveUniverse({ memories = DEFAULT_MEMORIES }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [finale, setFinale] = useState(false);
    const [visited, setVisited] = useState([]);
    const reduceMotion = useReducedMotion();
    const sectionRef = useRef(null);
    usePopupImagePreload(sectionRef, memories, POPUP_IMAGE);
    const ambientActive = useAmbientMotion(sectionRef);
    const universeRef = useRef(null);
    const [isCompactLayout, setIsCompactLayout] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 900px)");
        const updateLayout = () => setIsCompactLayout(mediaQuery.matches);

        updateLayout();
        mediaQuery.addEventListener("change", updateLayout);

        return () => mediaQuery.removeEventListener("change", updateLayout);
    }, []);

    const isSectionInView = useInView(sectionRef, {
        once: true,
        amount: 0.12,
    });

    const [revealComplete, setRevealComplete] = useState(false);

    useEffect(() => {
        if (!isSectionInView) return;

        if (reduceMotion) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRevealComplete(true);
            return;
        }

        const timer = window.setTimeout(() => {
            setRevealComplete(true);
        }, 1800);

        return () => window.clearTimeout(timer);
    }, [isSectionInView, reduceMotion]);

    const selectedMemory =
        selectedIndex === null ? null : memories[selectedIndex];

    const memoryCount = memories.length;

    const progress = useMemo(() => {
        if (!memoryCount) return 0;
        return Math.round((visited.length / memoryCount) * 100);
    }, [visited.length, memoryCount]);

    const openMemory = useCallback(
        (index) => {
            setFinale(false);
            setSelectedIndex(index);

            const memory = memories[index];
            if (!memory) return;

            setVisited((current) =>
                current.includes(memory.id) ? current : [...current, memory.id],
            );
        },
        [memories],
    );

    const closeMemory = useCallback(() => {
        setSelectedIndex(null);
        if (visited.length === memoryCount) {
            // eslint-disable-next-line react-hooks/immutability
            startFinale();
        }
    }, [memoryCount, visited.length]);

    const navigateMemory = useCallback(
        (direction) => {
            setSelectedIndex((current) => {
                if (current === null || memoryCount === 0) {
                    return null;
                }

                const next = (current + direction + memoryCount) % memoryCount;

                const memory = memories[next];

                if (memory) {
                    setVisited((visitedIds) =>
                        visitedIds.includes(memory.id)
                            ? visitedIds
                            : [...visitedIds, memory.id],
                    );
                }

                return next;
            });
        },
        [memories, memoryCount],
    );

    useEffect(() => {
        if (selectedIndex === null) return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") closeMemory();
            if (event.key === "ArrowRight") navigateMemory(1);
            if (event.key === "ArrowLeft") navigateMemory(-1);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [selectedIndex, closeMemory, navigateMemory]);

    const startFinale = () => {
        setSelectedIndex(null);
        window.setTimeout(() => {
            setFinale(true);
        }, 1000);

        window.setTimeout(() => {
            setFinale(false);
        }, 6500);
    };

    return (
        <section
            ref={sectionRef}
            className={`${styles.section} `}
            id="love-universe"
            data-ambient-active={ambientActive}
        >
            <Reveal>
                <SectionTitle
                    small="Our Love Universe"
                    title="Những khoảnh khắc"
                    subtitle="tạo nên một vũ trụ tình yêu thật lớn của tụi mình ♡"
                />
            </Reveal>
            <div ref={universeRef} className={styles.universe}>
                <UniverseCanvas
                    memories={memories}
                    finale={finale}
                    revealComplete={revealComplete}
                    layoutRef={universeRef}
                />

                <div className={styles.vignette} />

                <motion.div
                    className={styles.topNote}
                    data-parallax="text"
                    initial={
                        reduceMotion
                            ? false
                            : { opacity: 0, y: -18, rotate: -9 }
                    }
                    animate={
                        isSectionInView
                            ? { opacity: 1, y: 0, rotate: -9 }
                            : undefined
                    }
                    transition={{
                        duration: 0.9,
                        delay: 0.25,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    Our Love ♡<span>A universe of memories</span>
                </motion.div>

                <motion.div
                    className={styles.rightNote}
                    data-parallax="text"
                    initial={
                        reduceMotion
                            ? false
                            : { opacity: 0, x: 24, rotate: -5 }
                    }
                    animate={
                        isSectionInView
                            ? { opacity: 1, x: 0, rotate: -5 }
                            : undefined
                    }
                    transition={{
                        duration: 0.9,
                        delay: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    Different moments
                    <span>Same love</span>
                    <span>Forever us ♡</span>
                </motion.div>

                <div className={styles.memories}>
                    {memories.map((memory, index) => (
                        <motion.button
                            key={memory.id}
                            type="button"
                            className={styles.polaroid}
                            data-memory-index={index}
                            custom={{ index, compact: isCompactLayout }}
                            variants={memoryVariants}
                            initial={reduceMotion ? false : "hidden"}
                            animate={
                                isCompactLayout
                                    ? undefined
                                    : isSectionInView
                                      ? "visible"
                                      : "hidden"
                            }
                            whileInView={
                                isCompactLayout ? "visible" : undefined
                            }
                            viewport={
                                isCompactLayout
                                    ? {
                                          once: true,
                                          amount: 0.2,
                                          margin: "0px 0px -10% 0px",
                                      }
                                    : undefined
                            }
                            style={{
                                left: `${memory.x}%`,
                                top: `${memory.y}%`,
                                "--rotation": `${memory.rotate || 0}deg`,
                                "--delay": `${index * -0.45}s`,
                            }}
                            onClick={() => openMemory(index)}
                            aria-label={`Xem kỷ niệm ${memory.title}`}
                        >
                            <div className={styles.float} data-parallax="media">
                                <div className={styles.photoFrame}>
                                    <Image src={memory.image} alt={memory.title} width={348} height={356} sizes="(max-width: 600px) 145px, 174px" />
                                </div>

                                <div className={styles.photoDate}>{memory.date}</div>

                                <div className={styles.photoCaption}>
                                    {memory.caption || memory.title}
                                </div>

                                <div className={styles.memoryNumber}>
                                    <Heart size={11} fill="currentColor" />
                                    <span>{index + 1}</span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <motion.div
                    className={styles.leftQuote}
                    initial={
                        reduceMotion
                            ? false
                            : { opacity: 0, x: -28, y: 16, rotate: -10 }
                    }
                    animate={
                        isSectionInView
                            ? { opacity: 1, x: 0, y: 0, rotate: -10 }
                            : undefined
                    }
                    transition={{
                        duration: 1,
                        delay: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    Every moment
                    <br />
                    with you
                    <br />
                    is a star in
                    <br />
                    my universe ♡
                </motion.div>

                <div className={styles.bottomQuote} data-parallax="text">
                    Cảm ơn vì đã luôn ở đây,
                    <br />
                    trong mọi khoảnh khắc đẹp nhất của anh ♡
                </div>

                <div className={styles.landscape}>
                    <div className={styles.mountainBack} />
                    <div className={styles.mountainFront} />
                    <div className={styles.cityLights} />
                </div>

                <div className={styles.decorations}>
                    <div className={styles.lantern}>
                        <div className={styles.lanternTop} />
                        <div className={styles.lanternBody}>
                            <div className={styles.flame} />
                        </div>
                        <div className={styles.lanternBase} />
                    </div>

                    <div className={styles.bookStack}>
                        <div />
                        <div />
                        <div />
                    </div>
                </div>

                <div className={styles.bottomActions}>
                    {/* <motion.button
                        type="button"
                        className={styles.exploreButton}
                        onClick={startFinale}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        <Sparkles size={18} />
                        <span>Khám phá vũ trụ của chúng ta</span>
                        <ArrowRight size={17} />
                    </motion.button> */}

                    <span className={styles.instruction}>
                        Chạm vào những vì sao để xem kỷ niệm ✦
                    </span>

                    <div className={styles.progress}>
                        <span>
                            Đã khám phá {visited.length}/{memoryCount} kỷ niệm
                        </span>
                        <div className={styles.progressTrack}>
                            <div style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {finale && (
                        <motion.div
                            className={styles.finale}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            delay={0.5}
                        >
                            <motion.div
                                className={styles.finaleHeart}
                                initial={{ scale: 0.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 90,
                                    damping: 12,
                                }}
                            >
                                ♡
                            </motion.div>

                            <motion.h3
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Mỗi khoảnh khắc bên em
                                <br />
                                đều là một vì sao đẹp nhất.
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                            >
                                And our story is still being written... ✦
                            </motion.p>

                            <button
                                type="button"
                                onClick={() => setFinale(false)}
                                aria-label="Đóng lời nhắn"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {selectedMemory && (
                    <motion.div
                        className={styles.modalBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMemory}
                    >
                        <motion.div
                            key={selectedMemory.id}
                            className={styles.modalCard}
                            role="dialog"
                            aria-modal="true"
                            aria-label={selectedMemory.title}
                            initial={{
                                opacity: 0,
                                y: 60,
                                rotate: -8,
                                scale: 0.8,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                rotate: -2,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: 35,
                                scale: 0.85,
                            }}
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : {
                                        type: "spring",
                                        stiffness: 170,
                                        damping: 19,
                                    }
                            }
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={closeMemory}
                                aria-label="Đóng"
                            >
                                <X size={20} />
                            </button>

                            <div className={styles.modalPhoto}>
                                <Image src={selectedMemory.image} alt={selectedMemory.title} {...POPUP_IMAGE} loading="eager" />
                            </div>

                            <span className={styles.modalDate}>
                                ✦ {selectedMemory.date} ✦
                            </span>

                            <h3>{selectedMemory.title}</h3>

                            <p>{selectedMemory.message}</p>

                            <div className={styles.modalSignature}>With all my love ♡</div>

                            <div className={styles.modalNavigation}>
                                <button type="button" onClick={() => navigateMemory(-1)}>
                                    <ArrowLeft size={16} />
                                    Trước
                                </button>

                                <span>
                                    {selectedIndex + 1} / {memoryCount}
                                </span>

                                <button type="button" onClick={() => navigateMemory(1)}>
                                    Tiếp
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
