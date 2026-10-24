"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import styles from "../styles/GachaJackpot.module.scss";

const colors = ["#f7a8c4", "#ffd36b", "#ffffff", "#d9b7ff", "#a8e5d4"];

export default function GachaJackpot({ open, prize, onClose }) {
  const reduceMotion = useReducedMotion();
  const confetti = useMemo(() => Array.from({ length: 72 }, (_, i) => ({
    id: i,
    x: (i * 73.17) % 100,
    delay: (i * 0.137) % 2.5,
    duration: 2.8 + (i % 5) * 0.45,
    color: colors[i % colors.length],
    rotate: (i * 53) % 720,
  })), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && prize && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Trúng quà Gacha đặc biệt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {!reduceMotion && (
            <>
              <div className={styles.flash} aria-hidden="true" />
              <div className={styles.confetti} aria-hidden="true">
                {confetti.map((p) => (
                  <i
                    key={p.id}
                    className={styles.paper}
                    style={{
                      left: `${p.x}%`,
                      backgroundColor: p.color,
                      animationDelay: `${p.delay}s`,
                      animationDuration: `${p.duration}s`,
                      "--rotate": `${p.rotate}deg`,
                    }}
                  />
                ))}
              </div>
              <div className={styles.fireworks} aria-hidden="true">
                {[0, 1, 2, 3, 4].map((burst) => (
                  <div
                    key={burst}
                    className={styles.firework}
                    style={{
                      left: `${12 + burst * 19}%`,
                      top: `${16 + (burst % 3) * 16}%`,
                      animationDelay: `${burst * 0.42}s`,
                    }}
                  >
                    {Array.from({ length: 12 }, (_, ray) => (
                      <span key={ray} style={{
                        "--angle": `${ray * 30}deg`,
                        "--ray-color": colors[(ray + burst) % colors.length],
                      }} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
          <motion.div
            className={styles.card}
            initial={reduceMotion ? false : { scale: 0.55, rotate: -7, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          >
            <div className={styles.stars}>✦ ✧ ✦</div>
            <span className={styles.tag}>✧ JACKPOT ✧</span>
            <h2>TRÚNG QUÀ SIÊU ĐẶC BIỆT!</h2>
            <p className={styles.intro}>Một bất ngờ ngọt ngào dành riêng cho em ♡</p>
            <div className={styles.gift}>{prize.emoji || "🎁"}</div>
            <h3>{prize.title}</h3>
            {prize.message && <p className={styles.message}>{prize.message}</p>}
            <div className={styles.signature}>♡ Lucky in love ♡</div>
            <button type="button" onClick={onClose} autoFocus>
              Nhận món quà này ♡
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
