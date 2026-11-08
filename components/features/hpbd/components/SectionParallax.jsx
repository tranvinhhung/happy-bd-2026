"use client";

import { useEffect } from "react";

const layers = {
  heading: { distance: 46, lag: 1.15 },
  text: { distance: 30, lag: 1.25 },
  media: { distance: 66, lag: 1.35 },
  decoration: { distance: -54, lag: 1.5 },
};

export default function SectionParallax({ rootRef }) {
  useEffect(() => {
    let disposed = false;
    let media;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 600px)",
      }, (context) => {
        if (!context.conditions.motion) return;
        let contextDisposed = false;

        const root = rootRef.current;
        const strength = context.conditions.mobile ? 0.6 : 1;
        const sections = [...root.querySelectorAll("section")].filter((section) =>
          !section.matches(".hero, .intro") && section.querySelector("[data-parallax]"),
        );
        const triggers = new Map();
        let heldSection = null;
        let heldPointerId = null;

        // Create only nearby sections' tweens and record them in the GSAP context.
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || disposed || contextDisposed) return;
            const section = entry.target;
            observer.unobserve(section);

            context.add(() => {
              const sectionTriggers = [];
              section.querySelectorAll("[data-parallax]").forEach((element, index) => {
                const layer = layers[element.dataset.parallax];
                if (!layer || element.closest("section") !== section) return;
                if (element.parentElement.closest("[data-parallax]")?.dataset.parallax === element.dataset.parallax) return;
                const distance = layer.distance * strength * (0.88 + (index % 3) * 0.06);

                const tween = gsap.fromTo(element,
                  { "--section-parallax-y": `${distance * 0.45}px` },
                  {
                    "--section-parallax-y": `${-distance * 0.55}px`,
                    ease: "none",
                    scrollTrigger: {
                      trigger: section,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: layer.lag,
                    },
                  },
                );
                sectionTriggers.push(tween.scrollTrigger);
              });
              triggers.set(section, sectionTriggers);
            });
          });
        }, { rootMargin: "600px 0px" });
        sections.forEach((section) => observer.observe(section));

        // Let drag/scratch surfaces settle under the pointer while interacting.
        const hold = (event) => {
          if (heldSection || !(event.target instanceof Element) || !event.target.closest("[data-parallax-interactive]")) return;
          heldSection = event.target.closest("section");
          heldPointerId = event.pointerId;
          triggers.get(heldSection)?.forEach((trigger) => trigger.disable(false, false));
        };
        const release = (event) => {
          if (event?.pointerId !== undefined && event.pointerId !== heldPointerId) return;
          triggers.get(heldSection)?.forEach((trigger) => {
            trigger.enable(false, false);
            trigger.update();
          });
          heldSection = null;
          heldPointerId = null;
        };
        root.addEventListener("pointerdown", hold, true);
        window.addEventListener("pointerup", release);
        window.addEventListener("pointercancel", release);
        window.addEventListener("blur", release);

        return () => {
          contextDisposed = true;
          observer.disconnect();
          root.removeEventListener("pointerdown", hold, true);
          window.removeEventListener("pointerup", release);
          window.removeEventListener("pointercancel", release);
          window.removeEventListener("blur", release);
        };
      }, rootRef);
    };

    setup().catch((error) => {
      media?.revert();
      console.warn("Không thể khởi tạo parallax các phần:", error);
    });

    return () => {
      disposed = true;
      media?.revert();
    };
  }, [rootRef]);

  return null;
}
