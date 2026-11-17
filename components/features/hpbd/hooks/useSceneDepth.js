"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// CSS variables belong to a separate surface; drag, flips and entrances keep
// ownership of their existing transforms.
export default function useSceneDepth(rootRef, { scroll = true } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const moveX = gsap.quickTo(root, "--scene-x", { duration: 0.85, ease: "power3.out" });
      const moveY = gsap.quickTo(root, "--scene-y", { duration: 0.85, ease: "power3.out" });
      const reset = () => { moveX(0); moveY(0); };
      const move = (event) => {
        if (!pointer.matches || event.pointerType === "touch" || event.buttons || document.hidden) return;
        const rect = root.getBoundingClientRect();
        moveX(Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)));
        moveY(Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2)));
      };
      if (scroll) gsap.fromTo(root, { "--scene-scroll": -1 }, {
        "--scene-scroll": 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
      root.addEventListener("pointermove", move, { passive: true });
      root.addEventListener("pointerleave", reset);
      root.addEventListener("pointerdown", reset, { passive: true });
      pointer.addEventListener("change", reset);
      document.addEventListener("visibilitychange", reset);
      return () => {
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", reset);
        root.removeEventListener("pointerdown", reset);
        pointer.removeEventListener("change", reset);
        document.removeEventListener("visibilitychange", reset);
        moveX.tween.kill();
        moveY.tween.kill();
      };
    }, root);
    return () => media.revert();
  }, [rootRef, scroll]);
}
