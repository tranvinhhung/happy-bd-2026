"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import SecretEnding from "./SecretEnding";

const stars = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  duration: 2 + (index % 4),
  delay: index * 0.15,
}));

const floatingHearts = [
  { left: "8%", delay: 0, duration: 7, size: 18 },
  { left: "18%", delay: 2, duration: 8, size: 25 },
  { left: "30%", delay: 1, duration: 9, size: 15 },
  { left: "42%", delay: 3, duration: 7, size: 22 },
  { left: "55%", delay: 0.5, duration: 8, size: 16 },
  { left: "68%", delay: 2.5, duration: 9, size: 26 },
  { left: "78%", delay: 1.5, duration: 7, size: 18 },
  { left: "90%", delay: 4, duration: 9, size: 22 },
];

export default function Ending({ onJourneyActiveChange }) {
  const sectionRef = useRef(null);
  const isNear = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isNear) return;

    let disposed = false;
    let media;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        const select = gsap.utils.selector(section);

        // Entrance and ambient loops animate separate elements.
        gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: select(".ending__content")[0],
            start: "top 82%",
            toggleActions: "play none none none",
          },
        })
          .from(select(".ending-heart"), { opacity: 0, scale: 0.6, y: 16, duration: 0.95 })
          .from(select(".ending__eyebrow"), { opacity: 0, y: 14, duration: 0.65 }, 0.35)
          .from(select(".ending__title-line"), { opacity: 0, y: 28, duration: 0.85, stagger: 0.22 }, 0.65)
          .from(select(".ending__divider"), { opacity: 0, scaleX: 0, duration: 0.7 }, 1.6)
          .from(select(".ending__description"), { opacity: 0, y: 16, duration: 0.7 }, 1.9)
          .from(select(".ending__love-reveal"), { opacity: 0, y: 20, duration: 0.8 }, 2.1)
          .from(select(".ending__forever"), { opacity: 0, duration: 0.7 }, 2.45);

        const ambient = [];
        const loop = (target, vars) => {
          const tween = gsap.to(target, { paused: true, repeat: -1, ...vars });
          ambient.push(tween);
        };

        loop(select(".ending__glow--1"), {
          x: 35, y: 25, scale: 1.12, duration: 9, yoyo: true, ease: "sine.inOut",
        });
        loop(select(".ending__glow--2"), {
          x: -35, y: -25, scale: 0.92, duration: 11, yoyo: true, ease: "sine.inOut",
        });

        select(".ending__stars span").forEach((star, index) => {
          loop(star, {
            opacity: 0.7, scale: 1.25, duration: stars[index].duration,
            delay: stars[index].delay, yoyo: true, ease: "sine.inOut",
          });
        });

        select(".ending__floating-hearts span").forEach((heart, index) => {
          const { duration, delay } = floatingHearts[index];
          ambient.push(gsap.timeline({ paused: true, repeat: -1, delay, repeatRefresh: true })
            .fromTo(heart, { y: 80, x: -5, rotation: -8, opacity: 0 }, {
              y: () => -section.clientHeight - 80, x: 14, rotation: 12,
              duration, ease: "none",
            })
            .to(heart, { opacity: 0.4, duration: 1 }, 0.2)
            .to(heart, { opacity: 0, duration: 1 }, duration - 1));
        });

        loop(select(".ending-heart__glow"), {
          opacity: 0.55, scale: 1.2, duration: 1.2, yoyo: true, ease: "sine.inOut",
        });
        select(".ending-heart__ring").forEach((ring, index) => {
          ambient.push(gsap.fromTo(ring, { scale: 0.7, opacity: 0.4 }, {
            scale: 1.6, opacity: 0, duration: 2.5, delay: index * 1.2,
            repeat: -1, paused: true, ease: "power1.out",
          }));
        });

        ambient.push(gsap.timeline({ paused: true, repeat: -1 })
          .to(select(".ending-heart__main"), { scale: 1.06, duration: 0.16 })
          .to(select(".ending-heart__main"), { scale: 1, duration: 0.22 })
          .to(select(".ending-heart__main"), { scale: 1.1, duration: 0.18 })
          .to(select(".ending-heart__main"), { scale: 1, duration: 0.3 })
          .to(select(".ending-heart__main"), { scale: 1, duration: 0.94 }));
        loop(select(".ending-heart__orbit"), { rotation: 360, duration: 12, ease: "none" });
        loop(select(".ending__love strong"), { scale: 1.2, duration: 0.75, yoyo: true, ease: "sine.inOut" });

        let visibilityTrigger;
        const syncAmbient = () => {
          const playing = visibilityTrigger?.isActive && document.visibilityState === "visible";
          ambient.forEach((animation) => playing ? animation.resume() : animation.pause());
        };
        visibilityTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onToggle: syncAmbient,
        });
        document.addEventListener("visibilitychange", syncAmbient);
        syncAmbient();

        return () => document.removeEventListener("visibilitychange", syncAmbient);
      }, sectionRef);
    };

    setup().catch((error) => {
      media?.revert();
      console.warn("Không thể khởi tạo hiệu ứng đoạn kết:", error);
    });

    return () => {
      disposed = true;
      media?.revert();
    };
  }, [isNear]);

  return (
    <section ref={sectionRef} className="ending">
      <div className="ending__glow ending__glow--1" aria-hidden="true" />
      <div className="ending__glow ending__glow--2" aria-hidden="true" />

      <div className="ending__stars" data-parallax="decoration" aria-hidden="true">
        {stars.map((star, index) => (
          <span key={index} style={{ left: star.left, top: star.top, opacity: 0.2 }} />
        ))}
      </div>
      <div className="ending__floating-hearts" aria-hidden="true">
        {floatingHearts.map((heart, index) => (
          <span key={index} style={{ left: heart.left, fontSize: heart.size, opacity: 0 }}>♡</span>
        ))}
      </div>

      <div className="ending__content">
        <div className="ending-heart" data-parallax="media" aria-hidden="true">
          <div className="ending-heart__glow" style={{ opacity: 0.3 }} />
          {[0, 1].map((index) => <div key={index} className="ending-heart__ring" style={{ opacity: 0 }} />)}
          <div className="ending-heart__main">♡</div>
          <div className="ending-heart__orbit">
            <span className="ending-heart__mini ending-heart__mini--1">♥</span>
            <span className="ending-heart__mini ending-heart__mini--2">♡</span>
            <span className="ending-heart__mini ending-heart__mini--3">♥</span>
          </div>
        </div>

        <span className="ending__eyebrow">AND FINALLY...</span>
        <h2 data-parallax="heading">
          {["Cảm ơn em", "vì đã xuất hiện", "trong cuộc đời anh"].map((line) => (
            <span key={line} className="ending__title-line">{line}</span>
          ))}
        </h2>
        <div className="ending__divider" aria-hidden="true"><span>♡</span></div>
        <p className="ending__description" data-parallax="text">Hy vọng món quà nhỏ này sẽ khiến em mỉm cười.</p>
        <div className="ending__love-reveal" data-parallax="text">
          <motion.div
            className="ending__love"
            whileHover={reduceMotion ? undefined : { scale: 1.06, y: -3 }}
          >
            <span>Yêu em nhiều</span>
            <strong aria-hidden="true">♡</strong>
          </motion.div>
        </div>
        <span className="ending__forever">today · tomorrow · always</span>
        <SecretEnding onActiveChange={onJourneyActiveChange} />
      </div>
    </section>
  );
}
