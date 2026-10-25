"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GachaManager from "./GachaManager";
import GachaJackpot from "./GachaJackpot";
import styles from "../styles/LoveGacha.module.scss";

const capsuleColors = [
  "#f7a8c4",
  "#ffd3e0",
  "#e88ba9",
  "#f5c4d7",
  "#ffb6cb",
  "#e6a3c4",
];

const particleAngles = Array.from(
  { length: 16 },
  (_, i) => (i * Math.PI * 2) / 16,
);

const scrollReveal = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const machineReveal = {
  hidden: {
    opacity: 0,
    y: 65,
    scale: 0.88,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
    },
  },
};

const collectionReveal = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.85,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(index * 0.045, 0.45),
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export default function LoveGacha() {
  // idle -> rolling -> floating -> bursting -> letter
  const [phase, setPhase] = useState("idle");
  const [currentPrize, setCurrentPrize] = useState(null);
  const [jackpotPrize, setJackpotPrize] = useState(null);
  const [collected, setCollected] = useState([]);
  const [rollCount, setRollCount] = useState(0);
  const [progressLoading, setProgressLoading] = useState(true);
  const [specialUnlocked, setSpecialUnlocked] = useState(false);
  const MIN_ROLLS_FOR_SPECIAL = 20;
  const [managerOpen, setManagerOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("all");
  const [typesLoading, setTypesLoading] = useState(true);

  const [prizes, setPrizes] = useState([]);

  const loadPrizes = useCallback(async () => {
    const response = await fetch("/api/gacha", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không tải được danh sách Gacha");
    }

    const data = await response.json();
    setPrizes(data.items || []);
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      const response = await fetch("/api/gacha/progress", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      setRollCount(data.roll_count ?? 0);
      setSpecialUnlocked(data.special_unlocked === true);
    } catch (error) {
      console.error("Load progress:", error);
    } finally {
      setProgressLoading(false);
    }
  }, []);

  const loadTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/gacha/admin/types", {
        cache: "no-store",
      });

      console.log("Load types response:", response);

      if (!response.ok) {
        throw new Error("Không tải được loại Gacha");
      }

      const data = await response.json();

      setTypes(data.types || []);

      setSelectedTypeId((current) => {
        if (
          current !== "all" &&
          !(data.types || []).some((type) => type.id === current)
        ) {
          return "all";
        }

        return current;
      });
    } catch (error) {
      console.error("Error loading types:", error);
    } finally {
      setTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTypes().catch(console.error);
  }, [loadTypes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPrizes().catch(console.error);
    loadProgress().catch(console.error);
  }, [loadPrizes, loadProgress]);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const isRolling = phase === "rolling";
  const isOverlayOpen = ["floating", "bursting", "letter"].includes(phase);

  async function roll() {
    if (phase !== "idle" || typesLoading || jackpotPrize) return;

    setPhase("rolling");

    try {
      const response = await fetch("/api/gacha/roll", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type_id: selectedTypeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Quay Gacha thất bại");
      }

      setCurrentPrize(data.prize);
      setRollCount(data.roll_count);
      setSpecialUnlocked(data.special_unlocked);

      timerRef.current = setTimeout(() => {
        setPhase("floating");
      }, 1600);
    } catch (error) {
      console.error(error);
      setPhase("idle");
      alert(error.message);
    }
  }

  function openCapsule() {
    if (phase !== "floating") return;

    setPhase("bursting");

    timerRef.current = setTimeout(() => {
      setCollected((previous) =>
        previous.some((item) => item.id === currentPrize.id)
          ? previous
          : [...previous, currentPrize],
      );

      if (currentPrize?.is_special) {
        return setJackpotPrize(currentPrize);
      }

      setPhase("letter");
    }, 850);
  }

  function closeLetter() {
    if (phase !== "letter") return;

    setPhase("idle");
    setCurrentPrize(null);
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.heading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span>THE LOVE GACHA</span>

          <h2>
            Một chút <em>bất ngờ</em> cho em
          </h2>

          <p>
            Chiếc máy nhỏ này có những điều bí mật đăng sau. Cùng khám phá em
            nhé!
          </p>
        </motion.div>

        <motion.div
          className={styles.typeSelector}
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <p>Hôm nay em muốn nhận điều gì? ♡</p>

          <div className={styles.typeOptions}>
            {types.length > 1 && (
              <button
                type="button"
                className={selectedTypeId === "all" ? styles.typeActive : ""}
                disabled={
                  phase !== "idle" || typesLoading || Boolean(jackpotPrize)
                }
                onClick={() => setSelectedTypeId("all")}
              >
                🎀 Tất cả
              </button>
            )}

            {types.length > 1 &&
              types.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={
                    selectedTypeId === type.id ? styles.typeActive : ""
                  }
                  disabled={
                    phase !== "idle" || typesLoading || Boolean(jackpotPrize)
                  }
                  onClick={() => setSelectedTypeId(type.id)}
                >
                  {type.name}
                </button>
              ))}
          </div>
        </motion.div>

        <motion.div
          variants={machineReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className={styles.machine}
            animate={
              isRolling
                ? {
                    x: [0, -8, 8, -6, 6, -3, 3, 0],
                    rotate: [0, -4, 4, -3, 3, -2, 2, 0],
                  }
                : { x: 0, rotate: 0 }
            }
            transition={{
              duration: 0.55,
              repeat: isRolling ? 2 : 0,
            }}
          >
            <div className={styles.glass}>
              {capsuleColors.map((color, index) => (
                <motion.div
                  key={index}
                  className={styles.capsule}
                  style={{
                    background: `linear-gradient(
                    180deg,
                    ${color} 50%,
                    #fff5fa 50%
                  )`,
                  }}
                  animate={
                    isRolling
                      ? {
                          y: [0, -22, 10, 0],
                          rotate: [0, 25, -20, 0],
                        }
                      : { y: 0, rotate: 0 }
                  }
                  transition={{
                    duration: 0.5,
                    repeat: isRolling ? 2 : 0,
                    delay: index * 0.04,
                  }}
                >
                  ♥
                </motion.div>
              ))}
            </div>

            <div className={styles.machineBody}>
              <div className={styles.machineLabel}>
                LOVE GACHA
                <small>100% LOVE INSIDE</small>
              </div>

              <div className={styles.knob}>
                <motion.div
                  animate={{
                    rotate: isRolling ? 720 : 0,
                  }}
                  transition={{ duration: 1.5 }}
                >
                  ♡
                </motion.div>
              </div>

              <div className={styles.slot}>{isRolling ? "♡" : "PUSH"}</div>
            </div>

            <div className={styles.machineBase} />

            <AnimatePresence>
              {isRolling && (
                <motion.div
                  className={styles.fallingCapsule}
                  initial={{
                    opacity: 0,
                    y: -25,
                    scale: 0.5,
                    rotate: -30,
                  }}
                  animate={{
                    opacity: [0, 1, 1],
                    y: [-25, 20, 75],
                    scale: [0.5, 0.8, 1],
                    rotate: [-30, 90, 160],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.15,
                    delay: 0.35,
                    ease: "easeIn",
                  }}
                >
                  <span>♥</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.button
          type="button"
          className={styles.rollButton}
          onClick={roll}
          disabled={phase !== "idle" || typesLoading || Boolean(jackpotPrize)}
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          whileHover={{
            scale: 1.04,
            y: -3,
          }}
          whileTap={{
            scale: 0.96,
          }}
        >
          {phase === "idle" ? "Quay Gacha tình yêu ♡" : "Đang mở món quà..."}
        </motion.button>

        {process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && (
          <button
            type="button"
            className={styles.manageButton}
            onClick={() => setManagerOpen(true)}
          >
            ⚙ Quản lý Gacha
          </button>
        )}

        <GachaManager
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
          onChanged={() => {
            // Tải lại danh sách phần thưởng sau khi admin thay đổi.
            loadPrizes();
            loadTypes().catch(console.error);
          }}
        />

        <motion.p
          className={styles.progress}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Đã khám phá {collected.length}/{prizes.length} món quà
          {" · "}
          {rollCount} lượt quay
        </motion.p>

        <motion.div
          className={styles.collection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {prizes.map((prize, index) => {
            const isCollected = collected.some((item) => item.id === prize.id);

            return (
              <motion.div
                key={prize.id}
                className={styles.collectionItem}
                custom={index}
                variants={collectionReveal}
                title={isCollected ? prize.title : "Chưa khám phá"}
              >
                {isCollected ? prize.emoji : "?"}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {isOverlayOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.overlayGlow} />

            <AnimatePresence mode="wait">
              {phase === "floating" && (
                <motion.div
                  key="floating"
                  className={styles.capsuleScene}
                  initial={{ opacity: 0, scale: 0.3, y: 140 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 1.5,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                  }}
                >
                  <motion.button
                    type="button"
                    className={styles.floatingCapsule}
                    onClick={openCapsule}
                    aria-label="Chạm để mở viên gacha"
                    animate={{
                      y: [0, -17, 0],
                      rotate: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span>♥</span>
                  </motion.button>

                  <p className={styles.openHint}>
                    Chạm vào viên gacha để mở điều bất ngờ ✨
                  </p>
                </motion.div>
              )}

              {phase === "bursting" && (
                <motion.div
                  key="burst"
                  className={styles.burstScene}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className={styles.burstCapsule}
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{
                      scale: [1, 1.12, 0.8, 2.5],
                      rotate: [0, -15, 15, 0],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{ duration: 0.75 }}
                  >
                    ♥
                  </motion.div>

                  <motion.div
                    className={styles.flash}
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={{
                      opacity: [0, 0.9, 0],
                      scale: [0.2, 2, 3],
                    }}
                    transition={{
                      duration: 0.7,
                      delay: 0.2,
                    }}
                  />

                  {particleAngles.map((angle, index) => (
                    <motion.span
                      key={index}
                      className={styles.particle}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 0.4,
                      }}
                      animate={{
                        x: Math.cos(angle) * 190,
                        y: Math.sin(angle) * 190,
                        opacity: 0,
                        scale: 1.2,
                      }}
                      transition={{
                        duration: 0.75,
                        ease: "easeOut",
                      }}
                    >
                      {index % 2 === 0 ? "✦" : "♥"}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {phase === "letter" && currentPrize && (
                <motion.div
                  key="letter"
                  className={styles.letterScene}
                  initial={{
                    opacity: 0,
                    y: 90,
                    scale: 0.65,
                    rotate: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 50,
                    scale: 0.9,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 17,
                  }}
                >
                  <div className={styles.letterTape} />

                  <div className={styles.letterIcon}>{currentPrize.emoji}</div>

                  {(currentPrize.rare || currentPrize.is_special) && (
                    <span className={styles.rare}>✨ SPECIAL GIFT ✨</span>
                  )}

                  <span className={styles.letterEyebrow}>
                    A LITTLE LETTER FOR YOU
                  </span>

                  <h3>{currentPrize.title}</h3>

                  <p>{currentPrize.message}</p>

                  <div className={styles.letterSignature}>
                    With all my love ♡
                  </div>

                  <button
                    type="button"
                    className={styles.letterClose}
                    onClick={closeLetter}
                  >
                    Cất lá thư vào tim 💗
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <GachaJackpot
        open={Boolean(jackpotPrize)}
        prize={jackpotPrize}
        onClose={() => {
          setJackpotPrize(null);
          setPhase("idle");
          setCurrentPrize(null);
        }}
      />
    </section>
  );
}
