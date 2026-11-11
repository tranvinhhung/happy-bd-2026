"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import HandwritingLetter from "./HandwritingLetter.jsx";

export default function LoveLetter({ paragraphs }) {
  const sectionRef = useRef(null);
  const signatureTimelineRef = useRef(null);
  const completedRef = useRef(false);
  const [canWrite, setCanWrite] = useState(false);
  const [isWritingComplete, setIsWritingComplete] = useState(false);
  const isNear = useInView(sectionRef, { once: true, margin: "600px 0px" });

  const finishWriting = useCallback(() => {
    completedRef.current = true;
    setIsWritingComplete(true);
    signatureTimelineRef.current?.play();
  }, []);

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
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      }, (context) => {
        if (!context.conditions.motion) {
          setCanWrite(true);
          return;
        }

        const select = gsap.utils.selector(sectionRef.current);
        const paper = select(".letter");

        const signature = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
          .fromTo(select(".letter__signature"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.65 },
          )
          .fromTo(select(".letter__signature span"),
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: 0.6 }, 0.15,
          )
          .fromTo(select(".letter__signature strong"),
            { opacity: 0, scale: 0.3, rotation: -15 },
            { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" }, 0.5,
          );
        signatureTimelineRef.current = signature;
        if (completedRef.current) signature.progress(1);

        gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: paper[0], start: "top 85%", toggleActions: "play none none none" },
          // Handwriting starts only after the paper has settled.
          onComplete: () => { if (!disposed) setCanWrite(true); },
        })
          .fromTo(paper,
            { opacity: 0, y: 48, rotation: -3, scaleY: 0.94, transformOrigin: "50% 0%" },
            { opacity: 1, y: 0, rotation: -1, scaleY: 1, duration: 1 },
          )
          .fromTo(select(".letter__ribbon"),
            { opacity: 0, x: -24, rotation: -18 },
            { opacity: 1, x: 0, rotation: -10, duration: 0.6 }, 0.4,
          )
          .from(select(".letter__small"), { opacity: 0, y: 12, duration: 0.55 }, 0.65)
          .from(select(".letter h2"), { opacity: 0, y: 18, duration: 0.65 }, 0.8)
          .from(select(".letter__decor-heart"), { opacity: 0, duration: 0.5, stagger: 0.1 }, 0.8);

        return () => { signatureTimelineRef.current = null; };
      }, sectionRef);
    };

    setup().catch((error) => {
      media?.revert();
      signatureTimelineRef.current = null;
      if (!disposed) setCanWrite(true);
      console.warn("Không thể khởi tạo hiệu ứng lá thư:", error);
    });

    return () => {
      disposed = true;
      media?.revert();
      signatureTimelineRef.current = null;
    };
  }, [isNear]);

  return (
    <section ref={sectionRef} className="letter-section">
      <div className="letter" data-parallax="media">
        <div className="letter__ribbon" aria-hidden="true" />
        <span className="letter__small">A letter for you</span>
        <h2 data-parallax="heading">Gửi em,</h2>

        <div className="letter__content">
          <HandwritingLetter
            paragraphs={paragraphs}
            speed={65}
            enabled={canWrite}
            onComplete={finishWriting}
          />
        </div>

        <div className="letter__signature" data-parallax="text" data-writing-complete={isWritingComplete}>
          <span>Yêu em rất nhiều ♡</span>
          <strong aria-hidden="true">♡</strong>
        </div>

        <span className="letter__decor-heart letter__decor-heart--1" aria-hidden="true">♡</span>
        <span className="letter__decor-heart letter__decor-heart--2" aria-hidden="true">♡</span>
        <span className="letter__decor-heart letter__decor-heart--3" aria-hidden="true">♡</span>
      </div>
    </section>
  );
}
