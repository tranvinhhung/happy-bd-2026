
"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";

const GAME_DURATION = 26;
const TARGET_SCORE = 3000;
const MAX_HEARTS = 4;

const SPAWN_INTERVAL = 850;
const HEART_LIFETIME = 1300;
const COMBO_WINDOW = 1500;

const GOLD_CHANCE = 0.18;

const HEART_TYPES = {
    pink: {
        points: 100,
        color: "#F5A9C4",
        className: "is-pink",
    },
    gold: {
        points: 300,
        color: "#FFD36E",
        className: "is-gold",
    },
};

const random = (min, max) =>
    Math.random() * (max - min) + min;

function createHeart(id) {
    const type =
        Math.random() < GOLD_CHANCE ? "gold" : "pink";

    return {
        id,
        type,
        points: HEART_TYPES[type].points,
        color: HEART_TYPES[type].color,
        x: random(12, 88),
        y: random(15, 82),
        size: random(34, 48),
        rotation: random(-15, 15),
    };
}

export default function CatchHeartGame() {
    const reduceMotion = useReducedMotion();

    const [status, setStatus] = useState("idle");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

    const [hearts, setHearts] = useState([]);
    const [effects, setEffects] = useState([]);

    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [comboEffect, setComboEffect] = useState(null);

    const statusRef = useRef("idle");
    const scoreRef = useRef(0);
    const comboRef = useRef(0);
    const maxComboRef = useRef(0);

    const startedAtRef = useRef(0);
    const lastCatchAtRef = useRef(0);

    const heartIdRef = useRef(0);
    const effectIdRef = useRef(0);

    const activeHeartsRef = useRef(new Map());
    const expiryTimersRef = useRef(new Map());
    const effectTimersRef = useRef(new Map());

    const comboTimerRef = useRef(null);

    const clearHeartTimers = useCallback(() => {
        expiryTimersRef.current.forEach(clearTimeout);
        expiryTimersRef.current.clear();
        activeHeartsRef.current.clear();
    }, []);

    const clearEffectTimers = useCallback(() => {
        effectTimersRef.current.forEach(clearTimeout);
        effectTimersRef.current.clear();
    }, []);

    const clearComboTimer = useCallback(() => {
        if (comboTimerRef.current) {
            clearTimeout(comboTimerRef.current);
            comboTimerRef.current = null;
        }
    }, []);

    const finishGame = useCallback(
        (result) => {
            if (statusRef.current !== "playing") return;

            statusRef.current = result;
            setStatus(result);
            setHearts([]);

            clearHeartTimers();
            clearComboTimer();
        },
        [clearHeartTimers, clearComboTimer]
    );

    const spawnHeart = useCallback(() => {
        if (statusRef.current !== "playing") return;

        if (activeHeartsRef.current.size >= MAX_HEARTS) {
            return;
        }

        const id = ++heartIdRef.current;
        const heart = createHeart(id);

        activeHeartsRef.current.set(id, heart);

        setHearts((current) => [...current, heart]);

        const timer = setTimeout(() => {
            activeHeartsRef.current.delete(id);

            setHearts((current) =>
                current.filter((item) => item.id !== id)
            );

            expiryTimersRef.current.delete(id);
        }, HEART_LIFETIME);

        expiryTimersRef.current.set(id, timer);
    }, []);

    const startGame = useCallback(() => {
        clearHeartTimers();
        clearEffectTimers();
        clearComboTimer();

        heartIdRef.current = 0;
        effectIdRef.current = 0;

        scoreRef.current = 0;
        comboRef.current = 0;
        maxComboRef.current = 0;

        lastCatchAtRef.current = 0;
        startedAtRef.current = Date.now();

        statusRef.current = "playing";

        setStatus("playing");
        setScore(0);
        setTimeLeft(GAME_DURATION);

        setHearts([]);
        setEffects([]);

        setCombo(0);
        setMaxCombo(0);
        setComboEffect(null);
    }, [
        clearHeartTimers,
        clearEffectTimers,
        clearComboTimer,
    ]);

    const showCatchEffect = useCallback(
        (heart, currentCombo) => {
            if (reduceMotion) return;

            const id = ++effectIdRef.current;

            const effect = {
                id,
                x: heart.x,
                y: heart.y,
                points: heart.points,
                type: heart.type,
                combo: currentCombo,
            };

            setEffects((current) => [...current, effect]);

            const timer = setTimeout(() => {
                setEffects((current) =>
                    current.filter((item) => item.id !== id)
                );

                effectTimersRef.current.delete(id);
            }, 800);

            effectTimersRef.current.set(id, timer);
        },
        [reduceMotion]
    );

    const catchHeart = useCallback(
        (heart) => {
            if (statusRef.current !== "playing") return;

            // Chỉ cho phép bắt tim còn tồn tại.
            if (!activeHeartsRef.current.has(heart.id)) {
                return;
            }

            activeHeartsRef.current.delete(heart.id);

            const timer = expiryTimersRef.current.get(heart.id);

            if (timer) {
                clearTimeout(timer);
                expiryTimersRef.current.delete(heart.id);
            }

            setHearts((current) =>
                current.filter((item) => item.id !== heart.id)
            );

            // ======================================
            // Score
            // ======================================

            const nextScore = Math.min(
                TARGET_SCORE,
                scoreRef.current + heart.points
            );

            scoreRef.current = nextScore;
            setScore(nextScore);

            // ======================================
            // Combo
            // ======================================

            const now = Date.now();

            const isCombo =
                lastCatchAtRef.current > 0 &&
                now - lastCatchAtRef.current <= COMBO_WINDOW;

            const nextCombo = isCombo
                ? comboRef.current + 1
                : 1;

            comboRef.current = nextCombo;
            lastCatchAtRef.current = now;

            setCombo(nextCombo);

            if (nextCombo > maxComboRef.current) {
                maxComboRef.current = nextCombo;
                setMaxCombo(nextCombo);
            }

            clearComboTimer();

            comboTimerRef.current = setTimeout(() => {
                comboRef.current = 0;
                setCombo(0);
                setComboEffect(null);
            }, COMBO_WINDOW);

            // ======================================
            // Special combo milestones
            // ======================================

            if ([3, 5, 10].includes(nextCombo)) {
                setComboEffect(nextCombo);
            } else {
                setComboEffect(null);
            }

            showCatchEffect(heart, nextCombo);

            // ======================================
            // Win
            // ======================================

            if (nextScore >= TARGET_SCORE) {
                finishGame("won");
            }
        },
        [
            clearComboTimer,
            finishGame,
            showCatchEffect,
        ]
    );

    // ==========================================
    // Game loop
    // ==========================================

    useEffect(() => {
        if (status !== "playing") return;

        const tick = () => {
            const elapsed =
                Date.now() - startedAtRef.current;

            const remaining = Math.max(
                0,
                GAME_DURATION - Math.floor(elapsed / 1000)
            );

            setTimeLeft(remaining);

            if (remaining <= 0) {
                finishGame("lost");
            }
        };

        const clockInterval = setInterval(tick, 200);

        const spawnInterval = setInterval(
            spawnHeart,
            SPAWN_INTERVAL
        );

        // Sinh trái tim đầu tiên ngay khi bắt đầu.
        const initialSpawn = setTimeout(spawnHeart, 250);

        return () => {
            clearInterval(clockInterval);
            clearInterval(spawnInterval);
            clearTimeout(initialSpawn);
        };
    }, [status, finishGame, spawnHeart]);

    // ==========================================
    // Cleanup
    // ==========================================

    useEffect(() => {
        return () => {
            clearHeartTimers();
            clearEffectTimers();
            clearComboTimer();
        };
    }, [
        clearHeartTimers,
        clearEffectTimers,
        clearComboTimer,
    ]);

    const progress = Math.min(
        100,
        (score / TARGET_SCORE) * 100
    );

    return (
        <section className="catch-heart-game">
            <div className="catch-heart-game__ambient" />

            <motion.div
                className="catch-heart-game__heading"
                initial={
                    reduceMotion
                        ? false
                        : { opacity: 0, y: 35 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                    duration: 1.3,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                <span className="catch-heart-game__eyebrow">
                    A LITTLE GAME FOR YOU
                </span>

                <h2>
                    Catch My <em>Heart ♡</em>
                </h2>

                <p>
                    Bắt những trái tim đang bay để mở khóa
                    <br />
                    một lời nhắn bí mật dành riêng cho em.
                </p>
            </motion.div>

            <div className="catch-heart-game__wrapper">
                <div className="catch-heart-game__stats">
                    <div>
                        <span>TRÁI TIM</span>
                        <strong>
                            ♡ {score} / {TARGET_SCORE}
                        </strong>
                    </div>

                    <div>
                        <span>THỜI GIAN</span>
                        <strong>◷ {timeLeft}s</strong>
                    </div>
                </div>

                <div className="catch-heart-game__progress">
                    <motion.div
                        className="catch-heart-game__progress-fill"
                        animate={{
                            width: `${progress}%`,
                        }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Combo information */}
                <div className="catch-heart-game__combo-bar">
                    <div className="catch-heart-game__legend">
                        <span className="catch-heart-game__legend-pink">
                            ♥ Hồng +{HEART_TYPES.pink.points}
                        </span>

                        <span className="catch-heart-game__legend-gold">
                            ♥ Vàng +{HEART_TYPES.gold.points}
                        </span>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === "playing" && combo >= 2 && (
                            <motion.span
                                key={combo}
                                className="catch-heart-game__combo"
                                initial={{
                                    opacity: 0,
                                    scale: 0.6,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 1.1,
                                }}
                                transition={{
                                    duration: 0.2,
                                }}
                            >
                                COMBO x{combo} ✦
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Game Arena */}
                <div className="catch-heart-game__arena">
                    <div
                        className="catch-heart-game__decorations"
                        aria-hidden="true"
                    >
                        <span>✦</span>
                        <span>✧</span>
                        <span>✦</span>
                        <span>✧</span>
                    </div>

                    {/* Hearts */}
                    <AnimatePresence>
                        {status === "playing" &&
                            hearts.map((heart) => (
                                <motion.button
                                    key={heart.id}
                                    type="button"
                                    className={`catch-heart-game__heart ${HEART_TYPES[heart.type].className
                                        }`}
                                    style={{
                                        left: `${heart.x}%`,
                                        top: `${heart.y}%`,
                                        fontSize: heart.size,
                                        color: heart.color,
                                    }}
                                    initial={
                                        reduceMotion
                                            ? false
                                            : {
                                                opacity: 0,
                                                scale: 0.3,
                                                rotate: -20,
                                            }
                                    }
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: heart.rotation,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.2,
                                    }}
                                    transition={{
                                        duration: reduceMotion
                                            ? 0
                                            : 0.25,
                                    }}
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() =>
                                        catchHeart(heart)
                                    }
                                    aria-label={`Bắt tim ${heart.type === "gold"
                                            ? "vàng, 3 điểm"
                                            : "hồng, 1 điểm"
                                        }`}
                                >
                                    ♥
                                </motion.button>
                            ))}
                    </AnimatePresence>

                    {/* +1 / +3 effect */}
                    <AnimatePresence>
                        {effects.map((effect) => (
                            <motion.span
                                key={effect.id}
                                className={`catch-heart-game__effect ${effect.type === "gold"
                                        ? "is-gold"
                                        : ""
                                    }`}
                                style={{
                                    left: `${effect.x}%`,
                                    top: `${effect.y}%`,
                                }}
                                initial={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 0.7,
                                }}
                                animate={{
                                    opacity: 0,
                                    y: -50,
                                    scale: 1.3,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.7,
                                }}
                            >
                                +{effect.points} ♡
                            </motion.span>
                        ))}
                    </AnimatePresence>

                    {/* Combo milestone */}
                    <AnimatePresence>
                        {status === "playing" &&
                            comboEffect !== null && (
                                <motion.div
                                    key={comboEffect}
                                    className="catch-heart-game__combo-effect"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        y: 20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 1.3,
                                    }}
                                    transition={{
                                        duration: 0.35,
                                    }}
                                    style={{ x: "-50%" }}
                                >
                                    <strong>
                                        {comboEffect >= 10
                                            ? "PERFECT!"
                                            : comboEffect >= 5
                                                ? "AMAZING!"
                                                : "NICE!"}
                                    </strong>

                                    <span>
                                        COMBO x{comboEffect} ♡
                                    </span>
                                </motion.div>
                            )}
                    </AnimatePresence>

                    {/* Overlays */}
                    <AnimatePresence mode="wait">
                        {status === "idle" && (
                            <motion.div
                                key="idle"
                                className="catch-heart-game__overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <span className="catch-heart-game__big-heart">
                                    ♡
                                </span>

                                <h3>Sẵn sàng chưa em?</h3>

                                <p>
                                    Tim hồng +{HEART_TYPES.pink.points}, tim vàng +{HEART_TYPES.gold.points}.
                                    Bắt đủ {TARGET_SCORE} điểm trong {GAME_DURATION} giây nhé!
                                </p>

                                <button
                                    type="button"
                                    onClick={startGame}
                                >
                                    Bắt đầu chơi ♡
                                </button>
                            </motion.div>
                        )}

                        {status === "won" && (
                            <motion.div
                                key="won"
                                className="catch-heart-game__overlay"
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{ opacity: 0 }}
                            >
                                <span className="catch-heart-game__big-heart">
                                    ♥
                                </span>

                                <h3>Em bắt được trái tim anh rồi! ♡</h3>

                                <p>
                                    Chúc mừng sinh nhật em!
                                    Mong rằng mỗi ngày của em
                                    đều có thật nhiều niềm vui,
                                    bình an và những điều dịu dàng.
                                </p>

                                <span className="catch-heart-game__result-combo">
                                    Best Combo: x{maxCombo}
                                </span>

                                <button
                                    type="button"
                                    onClick={startGame}
                                >
                                    Chơi lại ↻
                                </button>
                            </motion.div>
                        )}

                        {status === "lost" && (
                            <motion.div
                                key="lost"
                                className="catch-heart-game__overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <span className="catch-heart-game__big-heart">
                                    ♡
                                </span>

                                <h3>Suýt tí nữa thôi!</h3>

                                <p>
                                    Em bắt được {score} điểm.
                                    Thử lại để mở khóa lời nhắn nhé!
                                    Cố lên em !!!
                                </p>

                                <button
                                    type="button"
                                    onClick={startGame}
                                >
                                    Thử lại ↻
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="catch-heart-game__footer">
                    Một trò chơi nhỏ, một niềm vui xinh xắn ✧
                </p>
            </div>
        </section>
    );
}
