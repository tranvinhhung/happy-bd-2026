"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { birthdayData as data } from "@/components/features/hpbd/utils/data/birthday";
import "./birthday.scss";

const Heart = ({ index }) => (
  <motion.span
    className="floating-heart"
    style={{
      left: `${5 + ((index * 17) % 90)}%`,
    }}
    initial={{
      y: 100,
      opacity: 0,
      scale: 0.5,
    }}
    animate={{
      y: -900,
      opacity: [0, 0.8, 0.8, 0],
      scale: [0.5, 1, 0.8],
      rotate: [0, 20, -15],
    }}
    transition={{
      duration: 8 + (index % 4),
      delay: index * 0.7,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    ♡
  </motion.span>
);

const FloatingHearts = () => {
  return (
    <div className="floating-hearts">
      {Array.from({ length: 12 }).map((_, index) => (
        <Heart key={index} index={index} />
      ))}
    </div>
  );
};

const Reveal = ({ children, className = "" }) => (
  <motion.div
    className={className}
    initial={{
      opacity: 0,
      y: 40,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
      amount: 0.25,
    }}
    transition={{
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
);

export default function BirthdayExperience() {
  const [giftOpened, setGiftOpened] = useState(false);
  const [started, setStarted] = useState(false);

  const openGift = () => {
    setGiftOpened(true);

    setTimeout(() => {
      setStarted(true);
    }, 1300);
  };

  return (
    <main className="birthday">
      <FloatingHearts />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.section
            key="intro"
            className="intro"
            exit={{
              opacity: 0,
              scale: 1.08,
              filter: "blur(15px)",
            }}
            transition={{ duration: 0.8 }}
          >
            <div className="intro__glow" />

            <motion.div
              className="intro__content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="eyebrow">A little surprise for you</span>

              <h1>
                {data.intro.title}
                <span>♡</span>
              </h1>

              <h2>{data.intro.subtitle}</h2>

              <p>{data.intro.description}</p>

              <div className={`gift ${giftOpened ? "gift--opened" : ""}`}>
                <motion.div
                  className="gift__lid"
                  animate={
                    giftOpened
                      ? {
                        y: -100,
                        rotate: -12,
                        opacity: 0,
                      }
                      : {}
                  }
                  transition={{
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                >
                  <div className="gift__ribbon-vertical" />
                  <div className="gift__bow">
                    <span />
                    <span />
                  </div>
                </motion.div>

                <div className="gift__box">
                  <div className="gift__ribbon-vertical" />

                  <AnimatePresence>
                    {giftOpened && (
                      <>
                        {[0, 1, 2, 3, 4, 5].map((item) => (
                          <motion.span
                            key={item}
                            className="gift__heart"
                            initial={{
                              x: 0,
                              y: 0,
                              opacity: 0,
                              scale: 0,
                            }}
                            animate={{
                              x: (item - 2.5) * 30,
                              y: -100 - (item % 3) * 40,
                              opacity: [0, 1, 0],
                              scale: [0, 1.3, 0.8],
                            }}
                            transition={{
                              duration: 1.3,
                              delay: item * 0.08,
                            }}
                          >
                            ♥
                          </motion.span>
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                className="love-button"
                onClick={openGift}
                disabled={giftOpened}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {giftOpened ? "Đang mở món quà..." : "Mở món quà ♡"}
              </motion.button>
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Hero />

            <Memories />

            <Timeline />

            <LoveLetter />

            <ThingsILove />

            <Promises />

            <BirthdayWish />

            <Ending />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Hero() {
  return (
    <section className="hero section-dark">
      <div className="stars" />

      <Reveal className="hero__content">
        <span className="eyebrow">19 · 12 · 2026</span>

        <h1>
          Happy
          <br />
          Birthday!
        </h1>

        <div className="hero__heart">♡</div>

        <p>{data.hero.description}</p>

        <div className="hero__couple">
          <img src="/images/bg.jpg" alt="Our memory" />
        </div>

        <span className="scroll-text">Cuộn xuống để xem món quà ↓</span>
      </Reveal>
    </section>
  );
}

function Memories() {
  return (
    <section className="memories section-paper">
      <Reveal>
        <SectionTitle
          small="Our Memories"
          title="Những khoảnh khắc"
          subtitle="đẹp nhất của chúng mình ♡"
        />
      </Reveal>

      <div className="polaroid-grid">
        {data.memories.map((memory, index) => (
          <motion.article
            className={`polaroid polaroid--${index + 1}`}
            key={memory.title}
            initial={{
              opacity: 0,
              y: 50,
              rotate: index % 2 ? 5 : -5,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              rotate: index % 2 ? 2 : -2,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: index * 0.15,
            }}
            whileHover={{
              rotate: 0,
              scale: 1.04,
              zIndex: 10,
            }}
          >
            <div className="tape" />

            <img src={memory.image} alt={memory.title} />

            <p>{memory.title}</p>

            <span>♡</span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="love-timeline">
      <Reveal className="love-timeline__header">
        <span>OUR STORY</span>

        <h2>Hành trình yêu xa của chúng mình ♡</h2>
      </Reveal>

      <div className="love-timeline__content">
        {/* Đường timeline cong */}
        <svg
          className="love-timeline__path"
          viewBox="0 0 100 720"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.path
            d="
              M50 0
              C25 70, 25 120, 50 175
              C75 230, 75 280, 50 350
              C25 420, 25 470, 50 535
              C75 600, 75 650, 50 720
            "
            fill="none"
            stroke="#ec9eaa"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
            }}
          />
        </svg>

        {data.timeline.map((item, index) => {
          const image = item.image || `/images/timelines/timeline-0${(index % 4) + 1}.jpg`;

          return (
            <motion.article
              key={`${item.title}-${index}`}
              className={`love-timeline__item ${index % 2 === 0
                ? "love-timeline__item--left"
                : "love-timeline__item--right"
                }`}
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.4,
              }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
              }}
            >
              {/* Ảnh */}
              <motion.div
                className="love-timeline__photo"
                whileHover={{
                  scale: 1.06,
                  rotate: index % 2 === 0 ? -3 : 3,
                }}
              >
                <span className="love-timeline__tape" />

                <img src={image} alt={item.title} />
              </motion.div>

              {/* Tim nằm giữa timeline */}
              <motion.div
                className="love-timeline__heart"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.25 + index * 0.12,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                ♥
              </motion.div>

              {/* Nội dung */}
              <div className="love-timeline__text">
                <span className="love-timeline__number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <motion.div
        className="love-timeline__scroll"
        animate={{
          y: [0, 7, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        ↓
      </motion.div>
    </section>
  );
}

const paragraphVariants = {
  hidden: {
    opacity: 0,
    y: 25,
    filter: "blur(3px)",
  },

  visible: index => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.9,
      delay: index * 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function LoveLetter() {
  return (
    <section className="letter-section">
      <motion.div
        className="letter"
        initial={{
          opacity: 0,
          y: 80,
          rotate: -3,
          scale: 0.94,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          rotate: -1,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Tape */}
        <motion.div
          className="letter__ribbon"
          initial={{
            opacity: 0,
            x: -80,
            rotate: -25,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            rotate: -10,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.4,
          }}
        />

        {/* small title */}

        <motion.span
          className="letter__small"
          initial={{
            opacity: 0,
            letterSpacing: "10px",
          }}
          whileInView={{
            opacity: 1,
            letterSpacing: "4px",
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1.2,
            delay: 0.3,
          }}
        >
          A letter for you
        </motion.span>

        {/* Gửi em */}

        <motion.h2
          initial={{
            opacity: 0,
            x: -30,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.45,
          }}
        >
          Gửi em,
        </motion.h2>

        {/* Nội dung */}

        <div className="letter__content">
          {data.letter.map((paragraph, index) => (
            <motion.div
              className="letter__paragraph"
              key={index}
              custom={index}
              variants={paragraphVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.6,
              }}
            >
              <p>{paragraph}</p>

              <motion.span
                className="letter__paragraph-heart"
                initial={{
                  opacity: 0,
                  scale: 0,
                  rotate: -20,
                }}
                whileInView={{
                  opacity: 0.5,
                  scale: 1,
                  rotate: 8,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.5 + index * 0.15,
                  type: "spring",
                }}
              >
                ♡
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Signature */}

        <motion.div
          className="letter__signature"
          initial={{
            opacity: 0,
            x: -30,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            delay: 0.4,
          }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
            }}
          >
            Yêu em rất nhiều
          </motion.span>

          <motion.strong
            initial={{
              scale: 0,
              rotate: -20,
            }}
            whileInView={{
              scale: 1,
              rotate: 0,
            }}
            viewport={{ once: true }}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              scale: {
                duration: 1.5,
                repeat: Infinity,
              },
            }}
          >
            ♡
          </motion.strong>
        </motion.div>

        {/* Decorative hearts */}

        <span className="letter__decor-heart letter__decor-heart--1">
          ♡
        </span>

        <span className="letter__decor-heart letter__decor-heart--2">
          ♡
        </span>

        <span className="letter__decor-heart letter__decor-heart--3">
          ♡
        </span>
      </motion.div>
    </section>
  );
}

function ThingsILove() {
  return (
    <section className="things section-paper">
      <Reveal>
        <SectionTitle
          small="What I Love"
          title="Những điều"
          subtitle="anh yêu ở em ♡"
        />
      </Reveal>

      <div className="notes">
        {data.thingsILove.map((item, index) => (
          <motion.div
            className="note"
            key={item}
            initial={{
              opacity: 0,
              scale: 0.8,
              rotate: index % 2 ? 6 : -6,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.1,
            }}
            whileHover={{
              scale: 1.06,
              rotate: 0,
            }}
          >
            <span className="note__tape" />
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Promises() {
  return (
    <section className="promises section-dark">
      <Reveal>
        <SectionTitle
          small="Our Future"
          title="Những lời hứa"
          subtitle="cho tương lai ♡"
          light
        />
      </Reveal>

      <div className="promise-list">
        {data.promises.map((promise, index) => (
          <motion.div
            className="promise"
            key={promise}
            initial={{
              opacity: 0,
              x: index % 2 ? 50 : -50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
            }}
          >
            <span>♡</span>
            {promise}
          </motion.div>
        ))}
      </div>

      <Reveal className="promise-image">
        <img src="/images/promises/promise-01.jpg" alt="Together" />
      </Reveal>
    </section>
  );
}

function BirthdayWish() {
  return (
    <section className="wish">
      <Reveal>
        <span className="eyebrow">Make a wish</span>

        <h2>
          Chúc em
          <br />
          tuổi mới ♡
        </h2>
      </Reveal>

      <div className="wish-list">
        {data.wishes.map((wish, index) => (
          <motion.div
            key={wish}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.1,
            }}
          >
            {wish}
          </motion.div>
        ))}
      </div>

      <Reveal className="cake">
        <div className="cake__candle">
          <motion.span
            className="cake__flame"
            animate={{
              scale: [1, 1.15, 0.9, 1],
              rotate: [-3, 4, -2],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          />
        </div>

        <div className="cake__top">
          <span>♡</span>
          <span>♡</span>
          <span>♡</span>
        </div>

        <div className="cake__body">
          <div className="cake__cream" />
          Happy Birthday
        </div>
      </Reveal>
    </section>
  );
}

const hearts = [
  { left: "12%", delay: 0, duration: 8 },
  { left: "28%", delay: 2, duration: 9 },
  { left: "52%", delay: 1, duration: 8 },
  { left: "72%", delay: 3, duration: 10 },
  { left: "88%", delay: 1.5, duration: 9 },
];

function Ending() {
  return (
    <section className="ending">
      {/* Chỉ dùng 1 glow */}
      <div className="ending__glow" />

      {/* Floating hearts - chỉ còn 5 */}
      <div className="ending__floating-hearts">
        {hearts.map((heart, index) => (
          <motion.span
            key={index}
            style={{ left: heart.left }}
            initial={{
              y: 50,
              opacity: 0,
            }}
            animate={{
              y: -800,
              opacity: [0, 0.35, 0.35, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ♡
          </motion.span>
        ))}
      </div>

      <div className="ending__content">
        {/* MAIN HEART */}
        <motion.div
          className="ending-heart"
          initial={{
            opacity: 0,
            scale: 0.6,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
          }}
        >
          <div className="ending-heart__glow" />

          <motion.span
            animate={{
              scale: [1, 1.08, 1, 1.12, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ♡
          </motion.span>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.15,
          }}
        >
          <span className="ending__eyebrow">
            AND FINALLY...
          </span>

          <h2>
            Cảm ơn em
            <br />
            vì đã xuất hiện
            <br />
            trong cuộc đời anh
          </h2>
        </motion.div>

        <motion.div
          className="ending__divider"
          initial={{
            opacity: 0,
            scaleX: 0,
          }}
          whileInView={{
            opacity: 1,
            scaleX: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.35,
          }}
        >
          <span>♡</span>
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.45,
          }}
        >
          Hy vọng món quà nhỏ này sẽ khiến em mỉm cười.
        </motion.p>

        <motion.div
          className="ending__love"
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.6,
          }}
        >
          <span>Yêu em nhiều</span>

          <motion.strong
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
          >
            ♡
          </motion.strong>
        </motion.div>

        <motion.span
          className="ending__forever"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            delay: 0.8,
          }}
        >
          today · tomorrow · always
        </motion.span>
      </div>
    </section>
  );
}

function SectionTitle({ small, title, subtitle, light = false }) {
  return (
    <header className={`section-title ${light ? "section-title--light" : ""}`}>
      <span>{small}</span>

      <h2>{title}</h2>

      <p>{subtitle}</p>
    </header>
  );
}
