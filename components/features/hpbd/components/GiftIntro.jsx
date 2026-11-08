"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import IntroTitle from "./IntroTitle..jsx";

export default function GiftIntro({ intro, onOpen, onComplete }) {
  const sectionRef = useRef(null);
  const openingRef = useRef(false);
  const idleRef = useRef(null);
  const timelineRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion === null) return;
    // Finish immediately if the motion preference changes during the sequence.
    if (openingRef.current) {
      onComplete();
      return;
    }

    let disposed = false;
    let context;

    const setup = async () => {
      const { gsap } = await import("gsap");
      if (disposed || !sectionRef.current) return;

      context = gsap.context(() => {
        const select = gsap.utils.selector(sectionRef.current);
        const gift = select(".gift");
        const hearts = select(".gift__heart");

        gsap.set(hearts, { opacity: 0, scale: 0 });
        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: "power2.out" },
          onComplete,
        });
        timelineRef.current = timeline;

        if (reduceMotion) {
          timeline.to(select(".gift__lid"), { opacity: 0, duration: 0.2 })
            .to(sectionRef.current, { opacity: 0, duration: 0.15 });
          return;
        }

        idleRef.current = gsap.timeline({ repeat: -1, repeatDelay: 2.8 })
          .to(gift, { rotation: -3, x: -2, duration: 0.14, delay: 1.2 })
          .to(gift, { rotation: 3, x: 2, duration: 0.14, repeat: 3, yoyo: true })
          .to(gift, { rotation: 0, x: 0, duration: 0.2 });

        timeline
          .to(gift, {
            x: 0, rotation: 0, y: 7, scaleX: 1.06, scaleY: 0.93,
            transformOrigin: "50% 100%", duration: 0.2,
          })
          .to(gift, { y: 0, scaleX: 1, scaleY: 1, duration: 0.4, ease: "back.out(1.5)" })
          .to(select(".gift__lid"), {
            x: 22, y: -130, rotation: -18, duration: 0.7,
          }, 0.35)
          .to(select(".gift__lid"), { opacity: 0, duration: 0.3 }, 0.8)
          .to(select(".gift__light"), { opacity: 0.9, scale: 1.8, duration: 0.6 }, 0.35)
          .to(hearts, { opacity: 1, duration: 0.12, stagger: 0.055 }, 0.5)
          .to(hearts, {
            x: (index) => (index - 3.5) * 27,
            y: (index) => -115 - (index % 3) * 32,
            rotation: (index) => (index - 3.5) * 8,
            scale: 1.2, duration: 1.1, stagger: 0.055,
          }, 0.5)
          .to(hearts, { opacity: 0, scale: 0.7, duration: 0.4, stagger: 0.055 }, 1.15)
          .to(select(".gift__light"), { opacity: 0, scale: 2.2, duration: 0.7 }, 1.15)
          .to(sectionRef.current, { opacity: 0, duration: 0.5 }, 1.9);
      }, sectionRef);

      setReady(true);
    };

    setup().catch((error) => {
      context?.revert();
      timelineRef.current = null;
      if (!disposed) setReady(true);
      console.warn("Không thể khởi tạo hiệu ứng mở quà:", error);
    });

    return () => {
      disposed = true;
      context?.revert();
      idleRef.current = null;
      timelineRef.current = null;
    };
  }, [onComplete, reduceMotion]);

  const openGift = () => {
    if (!ready || openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    onOpen();
    idleRef.current?.kill();
    if (timelineRef.current) timelineRef.current.play(0);
    else onComplete();
  };

  return (
    <motion.section
      ref={sectionRef}
      className="intro"
    >
      <div className="intro__glow" />
      <motion.div
        className="intro__content"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <span className="eyebrow">A little surprise for you</span>
        <IntroTitle />
        <h2>{intro.subtitle}</h2>
        <p>{intro.description}</p>

        <div className="gift" aria-hidden="true">
          <div className="gift__light" />
          <div className="gift__lid">
            <div className="gift__ribbon-vertical" />
            <div className="gift__bow"><span /><span /></div>
          </div>
          <div className="gift__box">
            <div className="gift__ribbon-vertical" />
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="gift__heart">♥</span>
            ))}
          </div>
        </div>

        <motion.button
          className="love-button"
          onClick={openGift}
          disabled={!ready || opening}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        >
          {opening ? "Đang mở món quà..." : "Mở món quà ♡"}
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
