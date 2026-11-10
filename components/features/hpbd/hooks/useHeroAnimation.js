"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { getImageProps } from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Start loading the two Hero images while the gift is still on screen.
export function useHeroPreload() {
  useEffect(() => {
    const assets = [
      { src: "/images/bg.jpg", alt: "", width: 600, height: 380, sizes: "(max-width: 600px) 80vw, 300px" },
      { src: "/images/hero/angel.webp", alt: "", width: 360, height: 360, sizes: "(max-width: 600px) 155px, 220px" },
    ];
    assets.forEach((asset) => {
      const { props } = getImageProps(asset);
      const image = new window.Image();
      image.decoding = "async";
      image.sizes = props.sizes;
      image.srcset = props.srcSet;
      image.src = props.src;
    });
  }, []);
}

export default function useHeroAnimation(heroRef) {
  const enteredRef = useRef(false);

  useLayoutEffect(() => {
    if (!heroRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 768px)",
    }, (context) => {
      if (!context.conditions.motion) {
        enteredRef.current = true;
        return;
      }

      const section = heroRef.current;
      const select = gsap.utils.selector(section);
      const photo = select(".hero__couple img");
      const strength = context.conditions.desktop ? 0.75 : 0.45;

      // All starting styles are applied before paint, without waiting for fonts or decode().
      gsap.set(photo, { scale: context.conditions.desktop ? 1.22 : 1.18, force3D: true });

      if (!enteredRef.current) {
        gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => { enteredRef.current = true; },
        })
          .fromTo(select(".hero__stars"), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0)
          .fromTo(select(".hero__date"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15)
          .fromTo(select(".hero__title-char"), {
            opacity: 0, yPercent: 55, rotation: 6,
          }, { opacity: 1, yPercent: 0, rotation: 0, stagger: 0.045, duration: 0.9 }, 0.3)
          .fromTo(select(".hero__heart"), { opacity: 0, scale: 0.4 }, {
            opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)",
          }, 0.8)
          .fromTo(select(".hero__description"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.95)
          .fromTo(select(".hero__couple"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, force3D: true }, 1.05)
          .fromTo(select(".scroll-text"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.55);
      }

      gsap.timeline({
        defaults: { ease: "none", duration: 1 },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      })
        .to(select(".hero__stars"), { y: 160 * strength, force3D: true }, 0)
        .to(select(".hero__stars span:nth-child(3n)"), { y: 70 * strength }, 0)
        .to(select(".hero__angel"), { y: 75 * strength, force3D: true }, 0)
        .to(select(".hero__heart"), { y: -45 * strength, force3D: true }, 0)
        .fromTo(photo,
          { y: context.conditions.desktop ? -12 : -8 },
          { y: context.conditions.desktop ? 12 : 8 }, 0,
        );
    }, heroRef);

    return () => media.revert();
  }, [heroRef]);
}
