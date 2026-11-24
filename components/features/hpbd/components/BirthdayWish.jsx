"use client";

import { Component, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import styles from "../styles/BirthdayWish.module.scss";
import SectionTitle from "./SectionTitle";
import WishFlower3D from "./WishFlower3D";
import useAmbientMotion from "../hooks/useAmbientMotion";
import useSceneDepth from "../hooks/useSceneDepth";

const WISH_MESSAGES = [
  "Mong em luôn rạng rỡ, tự tin và yêu thương chính mình mỗi ngày.",
  "Mong nụ cười của em luôn nhiều hơn những muộn phiền.",
  "Mong mọi cố gắng của em đều được đền đáp bằng những điều xứng đáng.",
  "Mong em luôn được yêu thương bằng sự chân thành và dịu dàng nhất.",
  "Mong chúng mình có thêm thật nhiều mùa sinh nhật cùng nhau.",
];

const PETALS = [
  { left: 5, delay: 0, duration: 12, size: 13, drift: 45 },
  { left: 15, delay: -5, duration: 15, size: 10, drift: -30 },
  { left: 27, delay: -9, duration: 13, size: 16, drift: 50 },
  { left: 41, delay: -2, duration: 17, size: 11, drift: -45 },
  { left: 58, delay: -7, duration: 14, size: 14, drift: 35 },
  { left: 72, delay: -3, duration: 16, size: 10, drift: -40 },
  { left: 84, delay: -11, duration: 13, size: 15, drift: 45 },
  { left: 94, delay: -6, duration: 18, size: 12, drift: -35 },
];

const SPARKS = Array.from({ length: 9 }, (_, index) => {
  const angle = (index / 9) * Math.PI * 2;

  return {
    x: Math.cos(angle) * (45 + (index % 3) * 12),
    y: Math.sin(angle) * (35 + (index % 2) * 15),
    delay: index * 0.025,
  };
});

function FallingPetals({ active }) {
  if (!active) return null;

  return (
    <div className={styles.petals} aria-hidden="true">
      {PETALS.map((petal, index) => (
        <motion.span
          key={index}
          className={styles.petal}
          style={{
            left: `${petal.left}%`,
            width: petal.size,
            height: petal.size * 1.4,
          }}
          initial={false}
          animate={{
            y: ["-10vh", "110vh"],
            x: [0, petal.drift, -petal.drift / 2],
            rotate: [0, 180, 400],
            opacity: [0, 0.65, 0.65, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function WishCard({ wish, index, active, onClick, reducedMotion }) {
  const message =
    WISH_MESSAGES[index] || "Mong mọi điều tốt đẹp nhất sẽ luôn đến với em. ♡";

  return (
    <motion.button
      type="button"
      className={`${styles.wishCard} ${active ? styles.wishCardActive : ""}`}
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 35,
              x: index % 2 === 0 ? -18 : 18,
              scale: 0.96,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.65,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reducedMotion ? undefined : { y: -3, scale: 1.012 }}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      onClick={onClick}
      aria-expanded={active}
    >
      <span className={styles.envelopeFold} aria-hidden="true" />
      <span className={styles.cardHeart} aria-hidden="true">♥</span>

      <span className={styles.cardContent}>
        <span className={styles.letterIndex}>LỜI CHÚC {String(index + 1).padStart(2, "0")}</span>
        <span className={styles.cardTitle}>{wish}</span>

        <AnimatePresence initial={false}>
          {active && (
            <motion.span
              className={styles.cardMessage}
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      height: 0,
                      marginTop: 0,
                    }
              }
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: 12,
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginTop: 0,
              }}
              transition={{ duration: 0.35 }}
            >
              <span className={styles.letterPaper}>
                <span className={styles.cardDivider} aria-hidden="true">✦ ♡ ✦</span>
                {message}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className={styles.cardDecoration} aria-hidden="true">{active ? "−" : "+"}</span>

      <AnimatePresence>
        {active && !reducedMotion && (
          <span className={styles.sparkLayer} aria-hidden="true">
            {SPARKS.map((spark, i) => (
              <motion.span
                key={i}
                className={styles.spark}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0.4,
                }}
                animate={{
                  x: spark.x,
                  y: spark.y,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1, 0.2],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: spark.delay,
                }}
              >
                {i % 2 === 0 ? "♡" : "✦"}
              </motion.span>
            ))}
          </span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

const Cake3D = dynamic(() => import("./BirthdayCake3D"), {
  ssr: false,
  loading: () => <span aria-hidden="true" style={{ alignSelf: "center", color: "#d985a2", fontSize: 50 }}>♡</span>,
});

class CakeBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function BirthdayCake({ reducedMotion, active }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: "600px 0px" });
  const fallback = <BirthdayCakeFallback reducedMotion={reducedMotion} active={active} />;
  return (
    <motion.div
      ref={ref}
      className={`${styles.cakeScene} ${styles.webglScene}`}
      data-parallax="media"
      initial={reducedMotion ? false : { opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
    >
      {near && <CakeBoundary fallback={fallback}>
        <Cake3D active={active} reducedMotion={reducedMotion} fallback={fallback} />
      </CakeBoundary>}
    </motion.div>
  );
}

function BirthdayCakeFallback({ reducedMotion, active }) {
  const cakeRef = useRef(null);
  useSceneDepth(cakeRef);
  return (
    <motion.div
      className={styles.cakeScene} data-parallax="media"
      initial={reducedMotion ? false : { opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div ref={cakeRef} className={styles.cakeStage}>
      <motion.div
        className={styles.cakeFloat}
        animate={active ? { y: [0, -8, 0] } : { y: 0 }}
        transition={{
          duration: 5,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <div className={styles.cakeDepth}>
        <div className={styles.cakeAura} />

        <div className={styles.candle}>
          <motion.div
            className={styles.flame}
            animate={
              !active
                ? { scale: 1, rotate: 0 }
                : {
                    scale: [1, 1.12, 0.94, 1],
                    rotate: [-3, 4, -2, -3],
                  }
            }
            transition={{
              duration: 0.85,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className={styles.cakeTopTier}>
          <div className={styles.topTierIcing} />
          <span>♡</span>
        </div>

        <div className={styles.cakeBottomTier}>
          <div className={styles.bottomTierIcing} />
          <div className={styles.cakeText}>Happy Birthday</div>
          <div className={styles.cakeHearts}>♡ ♡ ♡</div>
        </div>

        <div className={styles.cakePlate} />

        <span className={`${styles.cakeFlower} ${styles.flowerLeft}`}>✿</span>
        <span className={`${styles.cakeFlower} ${styles.flowerRight}`}>✿</span>
        <span className={`${styles.cakeStar} ${styles.starLeft}`}>✧</span>
        <span className={`${styles.cakeStar} ${styles.starRight}`}>♡</span>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}

export default function BirthdayWish({ data = [] }) {
  const sectionRef = useRef(null);
  const active = useAmbientMotion(sectionRef);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.1,
  });

  const [activeIndex, setActiveIndex] = useState(null);
  const [opened, setOpened] = useState([]);
  const [flowerOpen, setFlowerOpen] = useState(false);
  const hasPlayedFlowerRef = useRef(false);

  const wishes = data.wishes || WISH_MESSAGES;

  const allOpened = wishes.length > 0 && opened.length === wishes.length;

  useEffect(() => {
    if (allOpened && !hasPlayedFlowerRef.current) {
      hasPlayedFlowerRef.current = true;
      setFlowerOpen(true);
    }
  }, [allOpened]);

  const handleCardClick = (index) => {
    setActiveIndex((current) => (current === index ? null : index));

    setOpened((current) =>
      current.includes(index) ? current : [...current, index],
    );
  };

  return (
    <section ref={sectionRef} className={styles.section} id="birthday-wish">
      <div className={styles.backgroundGlow} data-parallax="decoration" />
      <FallingPetals active={active} />

      <div className={styles.container}>
        <motion.div
          className={styles.heading}
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  y: 35,
                  filter: "blur(8px)",
                }
          }
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {}
          }
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <SectionTitle
            small="Make a wish"
            title="Chúc em tuổi mới"
            subtitle="Năm lời chúc nhỏ,
            gửi đến người anh thương ♡"
          />
        </motion.div>

        <div className={styles.wishList} data-parallax="text">
          {wishes.map((wish, index) => (
            <WishCard
              key={`${index}-${wish}`}
              wish={wish}
              index={index}
              active={activeIndex === index}
              onClick={() => handleCardClick(index)}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <motion.p
          className={styles.hint}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          ✧ Chạm vào từng tấm thiệp để đọc lời nhắn nhỏ ♡
        </motion.p>

        <BirthdayCake reducedMotion={reducedMotion} active={active} />

        <motion.div
          className={styles.ending} data-parallax="text"
          initial={reducedMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
        >
          <span className={styles.endingDecoration}>✦ ♡ ✦</span>

          <p>
            Tuổi mới của em,
            <br />
            anh mong mỗi ngày đều là một ngày thật đẹp.
          </p>

          <span className={styles.endingSignature}>With all my love ♡</span>
        </motion.div>

        <AnimatePresence>
          {allOpened && (
            <motion.div
              className={styles.secretMessage}
              initial={
                reducedMotion ? false : { opacity: 0, y: 18, scale: 0.95 }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65 }}
              role="status"
            >
              <span className={styles.stoneLead}>♡ Và trong tất cả những lời chúc ấy,</span>
              <strong> anh mong tình yêu tụi mình ngày càng bền chặt, và trong tim tụi mình luôn có nhau.</strong>
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setFlowerOpen(true)}
                  aria-label="Xem lại hiệu ứng trao hoa 3D"
                  style={{
                    minHeight: 36,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(208, 122, 152, 0.35)",
                    background: "rgba(255, 224, 236, 0.7)",
                    color: "#9d4e6b",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  🌸 Xem lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <WishFlower3D
          open={flowerOpen}
          onClose={() => setFlowerOpen(false)}
        />
      </div>
    </section>
  );
}
