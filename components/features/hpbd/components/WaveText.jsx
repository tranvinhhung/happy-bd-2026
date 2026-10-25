"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import styles from "../styles/WaveText.module.scss";

export default function WaveText({
  text,
  className = "",
  wave = true,
  shine = true,
}) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    amount: 0.15,
  });

  const reduceMotion = useReducedMotion();

  const isActive = isInView && !reduceMotion;

  const words = String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    <span
      ref={ref}
      className={[
        styles.waveText,
        isActive ? styles.active : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={shine ? styles.shine : ""} aria-label={text}>
        {words.map((word, index) => (
          <span
            key={index}
            className={wave ? styles.word : ""}
            style={{
              "--word-index": index,
              marginRight: index === words.length - 1 ? 0 : "0.27em",
            }}
            aria-hidden="true"
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}