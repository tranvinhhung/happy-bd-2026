"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// CSS variables belong to a separate surface; drag, flips and entrances keep
// ownership of their existing transforms.
export default function useSceneDepth(rootRef, { scroll = true, pointerRef = null } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pointerRoot = pointerRef?.current || root;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const moveX = gsap.quickTo(root, "--scene-x", { duration: 0.55, ease: "power3.out" });
      const moveY = gsap.quickTo(root, "--scene-y", { duration: 0.55, ease: "power3.out" });
      const reset = () => { moveX(0); moveY(0); };
      const move = (event) => {
        if (!pointer.matches || event.pointerType === "touch" || event.buttons || document.hidden) return;
        const rect = pointerRoot.getBoundingClientRect();
        // Long sections can be taller than the screen. Normalize against the
        // visible area so moving across the viewport still produces a full tilt.
        const left = Math.max(0, rect.left);
        const top = Math.max(0, rect.top);
        const width = Math.max(1, Math.min(window.innerWidth, rect.right) - left);
        const height = Math.max(1, Math.min(window.innerHeight, rect.bottom) - top);
        moveX(Math.max(-1, Math.min(1, ((event.clientX - left) / width - 0.5) * 2)));
        moveY(Math.max(-1, Math.min(1, ((event.clientY - top) / height - 0.5) * 2)));
      };
      if (scroll) gsap.fromTo(root, { "--scene-scroll": -1 }, {
        "--scene-scroll": 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
      pointerRoot.addEventListener("pointermove", move, { passive: true });
      pointerRoot.addEventListener("pointerleave", reset);
      pointerRoot.addEventListener("pointerdown", reset, { passive: true });
      pointer.addEventListener("change", reset);
      document.addEventListener("visibilitychange", reset);
      return () => {
        pointerRoot.removeEventListener("pointermove", move);
        pointerRoot.removeEventListener("pointerleave", reset);
        pointerRoot.removeEventListener("pointerdown", reset);
        pointer.removeEventListener("change", reset);
        document.removeEventListener("visibilitychange", reset);
        moveX.tween.kill();
        moveY.tween.kill();
      };
    }, root);
    return () => media.revert();
  }, [rootRef, scroll, pointerRef]);
}
