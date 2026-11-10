"use client";

import { useEffect } from "react";
import { getImageProps } from "next/image";

// Warm the same responsive image URLs that the popup will use.
export default function usePopupImagePreload(sectionRef, memories, options) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      memories.forEach((memory) => {
        const { props } = getImageProps({
          src: memory.image,
          alt: "",
          ...options,
        });
        const image = new window.Image();
        image.decoding = "async";
        image.sizes = props.sizes;
        image.srcset = props.srcSet;
        image.src = props.src;
        image.decode().catch(() => {});
      });
    }, { rootMargin: "900px 0px" });

    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef, memories, options]);
}
