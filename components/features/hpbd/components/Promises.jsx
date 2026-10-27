"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import SectionTitle from "./SectionTitle";
import Reveal from "./Reveal";
import PromiseSlideshow from "./PromiseSlideshow";

// Những lời nhắn phụ xuất hiện khi nhấn vào lời hứa.
// Có thể chỉnh nội dung theo câu chuyện của hai bạn.
const promiseMessages = [
  "Dù ngày vui hay ngày buồn, anh vẫn muốn là người ở cạnh em.",
  "Còn rất nhiều nơi đẹp đang chờ chúng mình khám phá.",
  "Mỗi ngày bên em đều xứng đáng được lưu giữ.",
  "Anh sẽ luôn trân trọng những điều nhỏ bé thuộc về chúng ta.",
  "Mong sau này, tóc bạc rồi, chúng mình vẫn nắm tay nhau.",
];

function FloatingHearts() {
  const hearts = [
    { left: "7%", top: "16%", size: 14, delay: 0 },
    { left: "89%", top: "12%", size: 18, delay: 1.4 },
    { left: "12%", top: "48%", size: 13, delay: 2.2 },
    { left: "94%", top: "54%", size: 15, delay: 0.7 },
    { left: "8%", top: "81%", size: 20, delay: 1.8 },
    { left: "87%", top: "86%", size: 13, delay: 3 },
  ];

  return (
    <div className="promises-hearts" aria-hidden="true">
      {hearts.map((heart, index) => (
        <motion.span
          key={index}
          style={{
            left: heart.left,
            top: heart.top,
            fontSize: heart.size,
          }}
          animate={{
            y: [0, -22, 0],
            x: [0, 8, 0],
            opacity: [0.15, 0.5, 0.15],
            rotate: [-12, 12, -12],
          }}
          transition={{
            duration: 5 + index * 0.7,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ♡
        </motion.span>
      ))}
    </div>
  );
}

function PromiseCard({
  promise,
  index,
  isActive,
  isCompleted,
  onClick,
  reduceMotion,
}) {
  return (
    <motion.button
      type="button"
      className={[
        "promise-card",
        isActive ? "is-active" : "",
        isCompleted ? "is-completed" : "",
      ].join(" ")}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: index % 2 === 0 ? -55 : 55,
              y: 20,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.75,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.015, x: 4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      onClick={onClick}
      aria-expanded={isActive}
    >
      <span className="promise-card__number">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="promise-card__heart">
        <Heart
          size={19}
          fill={isCompleted ? "currentColor" : "none"}
          strokeWidth={1.7}
        />
      </span>

      <span className="promise-card__content">
        <span className="promise-card__text">{promise}</span>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              className="promise-card__message"
              initial={{
                height: 0,
                opacity: 0,
                marginTop: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
                marginTop: 10,
              }}
              exit={{
                height: 0,
                opacity: 0,
                marginTop: 0,
              }}
              transition={{ duration: 0.35 }}
            >
              {promiseMessages[index] ||
                "Anh sẽ luôn cố gắng thực hiện lời hứa này cùng em. ♡"}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <motion.span
        className="promise-card__sparkle"
        animate={
          isActive && !reduceMotion
            ? {
                rotate: [0, 20, -15, 0],
                scale: [1, 1.3, 1],
              }
            : {}
        }
        transition={{ duration: 0.6 }}
      >
        <Sparkles size={18} />
      </motion.span>

      <span className="promise-card__shine" />
    </motion.button>
  );
}

export default function Promises({ data }) {
  const [activePromise, setActivePromise] = useState(null);
  const [completedPromises, setCompletedPromises] = useState([]);
  const reduceMotion = useReducedMotion();

  const promises = data?.promises || [];

  const allCompleted =
    promises.length > 0 && completedPromises.length === promises.length;

  const handlePromiseClick = (index) => {
    setActivePromise((current) => (current === index ? null : index));

    setCompletedPromises((current) =>
      current.includes(index) ? current : [...current, index],
    );
  };

  return (
    <section className="promises-section section-dark" id="our-promises">
      <div className="promises-glow promises-glow--left" />
      <div className="promises-glow promises-glow--right" />

      <FloatingHearts />

      <div className="promises-inner">
        <Reveal>
          <SectionTitle
            small="Our Future"
            title="Những lời hứa"
            subtitle="cho tương lai ♡"
            light
          />
        </Reveal>

        <motion.p
          className="promises-intro"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Có những điều anh không chỉ muốn nói,
          <br />
          mà còn muốn cùng em thực hiện trong suốt những năm tháng sau này.
        </motion.p>

        <div className="promises-list">
          {promises.map((promise, index) => (
            <PromiseCard
              key={`${index}-${promise}`}
              promise={promise}
              index={index}
              isActive={activePromise === index}
              isCompleted={completedPromises.includes(index)}
              onClick={() => handlePromiseClick(index)}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        <div className="promises-progress">
          <span>
            {completedPromises.length} / {promises.length} lời hứa đã được mở ♡
          </span>

          <div className="promises-progress__track">
            <motion.div
              className="promises-progress__fill"
              animate={{
                width: `${
                  promises.length
                    ? (completedPromises.length / promises.length) * 100
                    : 0
                }%`,
              }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {allCompleted && (
            <motion.div
              className="promises-complete"
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{ duration: 0.7 }}
            >
              <Sparkles size={18} />
              <span>
                Năm lời hứa, một điều không đổi:
                <strong> Anh luôn chọn em. ♡</strong>
              </span>
              <Sparkles size={18} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="promises-photo-area"
          initial={{
            opacity: 0,
            y: 70,
            scale: 0.9,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="promises-photo-orbit" />

          <motion.div
            className="promises-photo"
            animate={reduceMotion ? {} : { y: [0, -10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <PromiseSlideshow />
          </motion.div>

          <motion.span
            className="promises-photo-heart promises-photo-heart--one"
            animate={
              reduceMotion
                ? {}
                : {
                    y: [0, -14, 0],
                    rotate: [-10, 10, -10],
                  }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          >
            ♡
          </motion.span>

          <motion.span
            className="promises-photo-heart promises-photo-heart--two"
            animate={
              reduceMotion
                ? {}
                : {
                    y: [0, 15, 0],
                  }
            }
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
          >
            ✧
          </motion.span>

          <motion.div
            className="promises-photo-caption"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            To all the tomorrows with you ♡
          </motion.div>
        </motion.div>

        <motion.div
          className="promises-ending"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Không cần biết tương lai sẽ như thế nào...
          <br />
          Chỉ mong rằng, trong tương lai ấy luôn có chúng mình.
          <span>Forever & always ♡</span>
        </motion.div>
      </div>
    </section>
  );
}
