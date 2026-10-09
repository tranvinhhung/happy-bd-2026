
"use client";

import { motion, useReducedMotion } from "framer-motion";

const sparkles = [
  { left: "12%", top: "25%", delay: 0 },
  { left: "85%", top: "20%", delay: 0.7 },
  { left: "5%", top: "65%", delay: 1.3 },
  { left: "90%", top: "70%", delay: 0.4 },
  { left: "45%", top: "5%", delay: 1.8 },
  { left: "65%", top: "90%", delay: 1 },
];

export default function BirthdayAngel() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="birthday-angel" aria-label="Thiên thần sinh nhật">
      {/* Ánh sáng phía sau */}
      <div className="birthday-angel__glow" />

      {/* Bay lên khi xuất hiện */}
      <motion.div
        className="birthday-angel__entrance"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 110,
                scale: 0.5,
                rotate: -12,
              }
        }
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
        }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 1.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Bay lơ lửng */}
        <motion.div
          className="birthday-angel__float"
          animate={
            reduceMotion
              ? {}
              : {
                  y: [0, -12, 0],
                  rotate: [0, 2, 0, -2, 0],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src="/images/hero/angel.webp"
            alt="Thiên thần nhỏ ôm trái tim"
            draggable={false}
          />
        </motion.div>
      </motion.div>

      {/* Hạt sáng */}
      <div className="birthday-angel__sparkles" aria-hidden="true">
        {sparkles.map((item, index) => (
          <motion.span
            key={index}
            style={{
              left: item.left,
              top: item.top,
            }}
            animate={
              reduceMotion
                ? {}
                : {
                    opacity: [0, 0.9, 0],
                    scale: [0.5, 1.2, 0.5],
                    y: [0, -12, -22],
                  }
            }
            transition={{
              duration: 3,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      {/* Trái tim nhỏ */}
      <motion.span
        className="birthday-angel__heart birthday-angel__heart--left"
        animate={
          reduceMotion
            ? {}
            : {
                y: [0, -15, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ♡
      </motion.span>

      <motion.span
        className="birthday-angel__heart birthday-angel__heart--right"
        animate={
          reduceMotion
            ? {}
            : {
                y: [0, -18, 0],
                opacity: [0.2, 0.7, 0.2],
                scale: [1, 1.15, 1],
              }
        }
        transition={{
          duration: 4.8,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ♡
      </motion.span>
    </div>
  );
}
