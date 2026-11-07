"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import "lenis/dist/lenis.css";

export default function BirthdaySmoothScroll({ enabled }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduceMotion !== false) return;

    let disposed = false;
    let cleanup;

    const setup = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({
        smoothWheel: true,
        wheelMultiplier: 0.65,
        lerp: 0.075,
        syncTouch: false,
        anchors: true,
        allowNestedScroll: true,
        // Nested textareas scroll natively only when they have overflowing content;
        // allowNestedScroll handles that without disabling smooth page scrolling.
        // Scratching uses pointer events, so its canvas also allows wheel scrolling.
        prevent: (node) => node.matches(
          "canvas:not([aria-hidden='true']):not(.scratch-reveal__canvas), select, [role='dialog'], [aria-modal='true'], .polaroid-album__lightbox",
        ),
      });

      // Use the same clock as GSAP so scroll animations follow the smoothed position.
      const tick = (time) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);

      // Existing dialogs lock the body. Stop any pending scroll momentum as well.
      const syncBodyLock = () => {
        const locked = ["hidden", "clip"].includes(
          getComputedStyle(document.body).overflowY,
        );
        if (locked) lenis.stop();
        else if (lenis.isStopped) lenis.start();
      };
      const observer = new MutationObserver(syncBodyLock);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
      syncBodyLock();

      cleanup = () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    };

    setup().catch((error) => {
      cleanup?.();
      console.warn("Không thể khởi tạo cuộn mượt:", error);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [enabled, reduceMotion]);

  return null;
}
