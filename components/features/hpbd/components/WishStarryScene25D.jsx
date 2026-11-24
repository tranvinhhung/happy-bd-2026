"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "../styles/WishStarryScene25D.module.scss";

const THREE_WISH_STARS = [
  { x: 26, y: 34, delay: 0.25 },
  { x: 50, y: 20, delay: 0.55 },
  { x: 74, y: 34, delay: 0.85 },
];

const TINY_STARS = [
  { x: 9, y: 18, size: 2, dur: "3.4s", delay: "0.2s" },
  { x: 16, y: 44, size: 2.5, dur: "4.2s", delay: "1.1s" },
  { x: 22, y: 14, size: 2, dur: "3.8s", delay: "0.7s" },
  { x: 35, y: 28, size: 3, dur: "4.6s", delay: "1.9s" },
  { x: 40, y: 12, size: 2, dur: "3.5s", delay: "0.4s" },
  { x: 61, y: 13, size: 2.5, dur: "4.4s", delay: "1.4s" },
  { x: 66, y: 30, size: 2, dur: "3.9s", delay: "0.9s" },
  { x: 82, y: 16, size: 3, dur: "4.8s", delay: "2.1s" },
  { x: 89, y: 38, size: 2, dur: "3.6s", delay: "0.5s" },
  { x: 14, y: 62, size: 2, dur: "4.1s", delay: "1.7s" },
  { x: 85, y: 58, size: 2.5, dur: "3.7s", delay: "1.2s" },
  { x: 48, y: 42, size: 2, dur: "4.5s", delay: "0.3s" },
];

export default function WishStarryScene25D({
  wishes = [],
  onSelectWish,
  autoScroll = false,
}) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef(null);
  const [replayKey, setReplayKey] = useState(0);

  // Chỉ bắt đầu chạy animation khi cảnh 2.5D nằm vào giữa/trong viewport
  const isInViewport = useInView(stageRef, {
    once: true,
    amount: 0.45,
  });

  useEffect(() => {
    if (!autoScroll || !stageRef.current) return;
    const timer = window.setTimeout(() => {
      stageRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [autoScroll, reduceMotion]);

  const active = isInViewport;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 170,
    damping: 22,
  });
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), {
    stiffness: 170,
    damping: 22,
  });

  const handlePointerMove = useCallback(
    (event) => {
      if (reduceMotion || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [reduceMotion, pointerX, pointerY],
  );

  const resetTilt = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <motion.div
        key={replayKey}
        className={styles.card3d}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        style={
          reduceMotion
            ? undefined
            : {
                rotateX: tiltX,
                rotateY: tiltY,
              }
        }
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 26, rotateX: 12, scale: 0.94 }
        }
        animate={
          active
            ? { opacity: 1, y: 0, rotateX: 0, scale: 1 }
            : { opacity: 0, y: 26, rotateX: 12, scale: 0.94 }
        }
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.backLayer} aria-hidden="true" />

        <div className={styles.scene}>
          {/* Bầu trời sao 2.5D với 3 ngôi sao sáng lấp lánh và 2 người ngồi ngắm */}
          <div className={styles.skyCanvas}>
            {TINY_STARS.map((star, idx) => (
              <span
                key={idx}
                className={styles.tinyStar}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  "--dur": star.dur,
                  "--delay": star.delay,
                }}
                aria-hidden="true"
              />
            ))}

            {/* Đường nối cung mờ giữa 3 ngôi sao điều ước */}
            <svg
              className={styles.constellationLine}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <motion.path
                d="M 26 34 Q 38 22 50 20 Q 62 22 74 34"
                fill="none"
                stroke="rgba(255, 214, 232, 0.38)"
                strokeWidth="0.45"
                strokeDasharray="1.5 1.5"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={
                  active
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 1.4, delay: 0.35, ease: "easeInOut" }}
              />
            </svg>

            {/* 3 Ngôi sao điều ước sáng lấp lánh */}
            {THREE_WISH_STARS.map((star, idx) => {
              const wish = wishes[idx];
              return (
                <motion.button
                  key={idx}
                  type="button"
                  className={styles.wishStarBtn}
                  style={{ left: `${star.x}%`, top: `${star.y}%` }}
                  initial={
                    reduceMotion ? false : { opacity: 0, scale: 0.2, y: 36 }
                  }
                  animate={
                    active
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 0, scale: 0.2, y: 36 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 14,
                    delay: star.delay,
                  }}
                  onClick={() => wish && onSelectWish?.(wish)}
                  aria-label={
                    wish
                      ? `Xem lại điều ước thứ ${idx + 1}`
                      : `Ngôi sao điều ước ${idx + 1}`
                  }
                >
                  <span
                    className={styles.wishStarCore}
                    style={{ "--star-delay": `${idx * 0.45}s` }}
                  >
                    ✦
                  </span>
                </motion.button>
              );
            })}

            {/* Đồi cỏ & bóng dáng 2 người ngồi tựa vai nhau ngắm bầu trời sao */}
            <motion.div
              className={styles.coupleHill}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              aria-hidden="true"
            >
              <svg
                className={styles.coupleSvg}
                viewBox="0 0 600 140"
                preserveAspectRatio="xMidYMax slice"
                fill="none"
              >
                <defs>
                  <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1b1938" />
                    <stop offset="100%" stopColor="#0d1024" />
                  </linearGradient>
                  <linearGradient id="rimGlow" x1="250" y1="40" x2="350" y2="120" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffb7d5" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#7a68a8" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Ngọn đồi mềm */}
                <path
                  d="M0 140 L0 108 Q150 68 300 84 Q450 100 600 76 L600 140 Z"
                  fill="url(#hillGrad)"
                />
                <path
                  d="M0 108 Q150 68 300 84 Q450 100 600 76"
                  stroke="rgba(255, 198, 224, 0.28)"
                  strokeWidth="1.5"
                />

                {/* Bóng dáng bạn nam (bên trái, hơi ngước lên) */}
                <g>
                  {/* Đầu nam */}
                  <circle cx="283" cy="54" r="10.5" fill="#14132b" stroke="url(#rimGlow)" strokeWidth="1.2" />
                  {/* Thân & vai nam ngồi */}
                  <path
                    d="M266 98 C266 78 273 66 284 66 C295 66 300 76 300 94 L296 106 L266 104 Z"
                    fill="#14132b"
                    stroke="url(#rimGlow)"
                    strokeWidth="1.1"
                  />
                  {/* Chân nam khoanh/duỗi nhẹ trên đồi */}
                  <path
                    d="M268 101 Q254 103 250 110 Q268 112 288 107 Z"
                    fill="#14132b"
                  />
                </g>

                {/* Bóng dáng bạn nữ (bên phải, đầu hơi tựa nhẹ về phía vai anh) */}
                <g>
                  {/* Tóc dài bay nhẹ */}
                  <path
                    d="M312 50 C324 50 329 66 325 82 C320 84 313 78 310 68 Z"
                    fill="#181633"
                  />
                  {/* Đầu nữ hơi nghiêng tựa */}
                  <circle cx="309" cy="58" r="9.5" fill="#14132b" stroke="url(#rimGlow)" strokeWidth="1.2" />
                  {/* Thân nữ ngồi sát bên */}
                  <path
                    d="M297 98 C297 79 302 69 311 69 C320 69 325 80 325 98 L322 106 L296 104 Z"
                    fill="#14132b"
                    stroke="url(#rimGlow)"
                    strokeWidth="1.1"
                  />
                </g>

                {/* Trái tim nhỏ ửng hồng giữa hai người */}
                <text
                  x="297"
                  y="40"
                  textAnchor="middle"
                  fill="#ff9ec7"
                  fontSize="12"
                  opacity="0.9"
                >
                  ♡
                </text>
              </svg>
            </motion.div>
          </div>

          {/* Lời chúc dưới cảnh 2.5D */}
          <motion.div
            className={styles.messageArea}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <span className={styles.eyebrow}>THREE LITTLE WISHES ✦</span>
            <p className={styles.messageText}>
              Ba điều ước nhỏ đã được gửi lên những vì sao,
              <strong>
                mong mọi điều ước của em sẽ sớm thành hiện thực. ✦
              </strong>
            </p>

            <button
              type="button"
              className={styles.replayBtn}
              onClick={() => {
                stageRef.current?.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                  block: "center",
                });
                setReplayKey((k) => k + 1);
              }}
            >
              ✦ Xem lại khoảnh khắc
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
