
"use client";

import { useEffect, useState } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Tải trước các ảnh để tránh nháy khi chuyển.
    images.forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div className="promises-slideshow">
      <AnimatePresence initial={false}>
        <motion.img
          key={images[currentIndex].src}
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="promises-slideshow__image"
          initial={{
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
        />
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
