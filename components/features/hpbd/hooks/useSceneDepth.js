"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let orientationPermissionRequest;

function requestOrientationPermission() {
  const OrientationEvent = window.DeviceOrientationEvent;
  if (typeof OrientationEvent?.requestPermission !== "function") return Promise.resolve(true);
  if (!orientationPermissionRequest) {
    orientationPermissionRequest = OrientationEvent.requestPermission()
      .then((permission) => permission === "granted")
      .catch(() => false);
  }
  return orientationPermissionRequest;
}

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
      const moveDuration = pointer.matches ? 0.55 : 0.22;
      const moveX = gsap.quickTo(root, "--scene-x", { duration: moveDuration, ease: "power3.out" });
      const moveY = gsap.quickTo(root, "--scene-y", { duration: moveDuration, ease: "power3.out" });
      const reset = () => { moveX(0); moveY(0); };
      let orientationBaseline = null;
      const supportsOrientation = "DeviceOrientationEvent" in window;
      const orient = (event) => {
        if (pointer.matches || document.hidden || event.gamma == null || event.beta == null) return;
        if (!orientationBaseline) orientationBaseline = { gamma: event.gamma, beta: event.beta };
        // Center on the phone's starting position. A 12-degree tilt now
        // reaches full depth, with a quicker tween so it feels responsive.
        moveX(Math.max(-1, Math.min(1, (event.gamma - orientationBaseline.gamma) / 12)));
        moveY(Math.max(-1, Math.min(1, (event.beta - orientationBaseline.beta) / 12)));
      };
      const enableOrientation = () => {
        if (!supportsOrientation || pointer.matches || document.hidden) return;
        requestOrientationPermission().then((granted) => {
          if (granted) window.addEventListener("deviceorientation", orient, { passive: true });
        });
      };
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
      pointerRoot.addEventListener("pointerdown", enableOrientation, { passive: true });
      if (supportsOrientation && !pointer.matches && typeof window.DeviceOrientationEvent?.requestPermission !== "function") {
        window.addEventListener("deviceorientation", orient, { passive: true });
      }
      pointer.addEventListener("change", reset);
      document.addEventListener("visibilitychange", reset);
      return () => {
        pointerRoot.removeEventListener("pointermove", move);
        pointerRoot.removeEventListener("pointerleave", reset);
        pointerRoot.removeEventListener("pointerdown", reset);
        pointerRoot.removeEventListener("pointerdown", enableOrientation);
        window.removeEventListener("deviceorientation", orient);
        pointer.removeEventListener("change", reset);
        document.removeEventListener("visibilitychange", reset);
        moveX.tween.kill();
        moveY.tween.kill();
      };
    }, root);
    return () => media.revert();
  }, [rootRef, scroll, pointerRef]);
}
