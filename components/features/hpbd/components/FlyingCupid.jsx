
"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function FlyingCupid() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flying-cupid">
      {/* Bay từ dưới lên */}
      <motion.div
        className="flying-cupid__entrance"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 130,
                scale: 0.55,
                rotate: -8,
              }
        }
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 2.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Lơ lửng */}
        <motion.div
          className="flying-cupid__floating"
          animate={
            reduceMotion
              ? {}
              : {
                  y: [0, -12, 0],
                  rotate: [-2, 2, -2],
                }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Cánh trái */}
          <motion.img
            className="flying-cupid__wing flying-cupid__wing--left"
            src="/images/hero/cupid-wing-left.png"
            alt=""
            animate={
              reduceMotion
                ? {}
                : {
                    rotate: [-8, 14, -8],
                    scaleX: [1, 0.88, 1],
                  }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Cánh phải */}
          <motion.img
            className="flying-cupid__wing flying-cupid__wing--right"
            src="/images/hero/cupid-wing-right.png"
            alt=""
            animate={
              reduceMotion
                ? {}
                : {
                    rotate: [8, -14, 8],
                    scaleX: [1, 0.88, 1],
                  }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Thân Cupid */}
          <img
            className="flying-cupid__body"
            src="/images/hero/cupid-body.png"
            alt="Thiên thần Cupid ôm trái tim"
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
