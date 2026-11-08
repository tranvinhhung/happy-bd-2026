
"use client";

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import useAmbientMotion from "./useAmbientMotion";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

const images = [
  {
    src: "/images/promises/promise-01.jpg",
    alt: "Khoảnh khắc kỷ niệm đầu tiên",
  },
  {
    src: "/images/promises/promise-02.jpg",
    alt: "Khoảnh khắc kỷ niệm thứ hai",
  },
  {
    src: "/images/promises/promise-03.jpg",
    alt: "Khoảnh khắc kỷ niệm thứ ba",
  },
];

export default function PromiseSlideshow() {
  const ref = useRef(null);
  const active = useAmbientMotion(ref);
  const [currentIndex, setCurrentIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    // Preload only the next optimized image, and only while the album is visible.
    const { props } = getImageProps({
      ...images[(currentIndex + 1) % images.length],
      width: 600, height: 800, sizes: "(max-width: 600px) 80vw, 400px",
    });
    const image = new window.Image();
    image.sizes = props.sizes;
    image.srcset = props.srcSet;
    image.src = props.src;
  }, [active, currentIndex]);

  useEffect(() => {
    if (!active) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [active]);

  return (
    <div ref={ref} className="promises-slideshow">
      <AnimatePresence initial={false}>
        <motion.div
          key={images[currentIndex].src}
          className="promises-slideshow__image"
          initial={reduceMotion ? false : {
            opacity: 0,
            scale: 1.06,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.04,
          }}
          transition={{
            duration: 0.45,
            ease: "easeInOut",
          }}
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            sizes="(max-width: 600px) 80vw, 400px"
            style={{ objectFit: "cover", objectPosition: "center 55%" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="promises-slideshow__dots">
        {images.map((image, index) => (
          <span
            key={image.src}
            className={
              index === currentIndex ? "is-active" : ""
            }
          />
        ))}
      </div>
    </div>
  );
}
