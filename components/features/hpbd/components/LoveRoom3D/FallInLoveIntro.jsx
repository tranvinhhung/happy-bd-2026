"use client";

import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "../../styles/FallInLoveIntro.module.scss";

const WORDS = [
  { text: "FALL", width: 320 },
  { text: "IN", width: 150 },
  { text: "LOVE", width: 350 },
];
const FILL_DURATION = 800;
// Start the next letter while the previous one is still being pumped.
const LETTER_STEP = 180;
const WORD_PAUSE = 300;
const LETTER_WIDTH = { F: .85, A: 1, L: .8, I: .45, N: 1, O: 1, V: 1, E: .85 };
let nextFill = 3000;
const WORD_SEQUENCE = WORDS.map((word) => {
  const weights = [...word.text].map((letter) => LETTER_WIDTH[letter]);
  const totalWidth = weights.reduce((sum, weight) => sum + weight, 0);
  let offset = 14;
  const letters = [...word.text].map((letter, index) => {
    const width = (word.width - 28) * weights[index] / totalWidth;
    const item = { letter, x: offset + width / 2, width: width - 4, delay: nextFill };
    offset += width;
    nextFill += LETTER_STEP;
    return item;
  });
  nextFill += FILL_DURATION - LETTER_STEP + WORD_PAUSE;
  return { ...word, letters };
});
const GLOW_DELAY = nextFill - WORD_PAUSE + 100;
const GLOW_DURATION = 650;
const DURATION = GLOW_DELAY + GLOW_DURATION + 900;

export default function FallInLoveIntro({ active, onComplete }) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const elapsedRef = useRef(0);

  // Pause both the CSS and the handoff timer when the room is out of view.
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = reduced ? 350 : DURATION;
    const timer = window.setTimeout(onComplete, Math.max(0, duration - elapsedRef.current));
    return () => {
      window.clearTimeout(timer);
      elapsedRef.current += Math.max(0, performance.now() - start);
    };
  }, [active, reduced, onComplete]);

  return (
    <div className={styles.intro} style={{ "--intro-duration": `${DURATION}ms`, "--fill-duration": `${FILL_DURATION}ms`, "--glow-delay": `${GLOW_DELAY}ms`, "--glow-duration": `${GLOW_DURATION}ms` }} data-active={active} data-fall-in-love role="status" aria-label="Fall in love">
      <span className={styles.eyebrow}>OUR LITTLE LOVE STORY</span>
      <div className={styles.words} aria-hidden="true">
        {WORD_SEQUENCE.map(({ text, width, letters }, index) => {
          const gradient = `${id}-liquid-${index}`;
          return (
            <div key={text} className={styles.word} style={{ "--word-width": width }} data-liquid-word={text}>
              <svg viewBox={`0 0 ${width} 160`}>
                <defs>
                  <linearGradient id={gradient} x1="0" y1="0" x2="0.2" y2="1">
                    <stop offset="0" stopColor="#ffe2ee" />
                    <stop offset=".35" stopColor="#f49bc4" />
                    <stop offset="1" stopColor="#bc5794" />
                  </linearGradient>
                </defs>
                {letters.map(({ letter, x, width: letterWidth, delay }, letterIndex) => {
                  const clip = `${id}-word-${index}-letter-${letterIndex}`;
                  const textProps = { x, y: 123, textAnchor: "middle", textLength: letterWidth, lengthAdjust: "spacingAndGlyphs" };
                  return <g key={letterIndex} data-liquid-letter={letter} style={{ "--fill-delay": `${delay}ms` }}>
                <defs><clipPath id={clip}><text {...textProps}>{letter}</text></clipPath></defs>
                {[9, 6, 3].map((offset) => <text key={offset} {...textProps} transform={`translate(${offset} ${offset * .8})`} className={styles.extrusion}>{letter}</text>)}
                <text {...textProps} className={styles.glass}>{letter}</text>
                <g clipPath={`url(#${clip})`}>
                  <g className={styles.water}>
                    <rect x="-60" y="12" width={width + 120} height="180" fill={`url(#${gradient})`} />
                    <path className={styles.wave} d={`M-80 12 Q-40 -1 0 12 T80 12 T160 12 T240 12 T320 12 T400 12 T480 12 V35 H-80Z`} fill="#ffd4e8" />
                    {[0, 1, 2].map((bubble) => <circle key={bubble} className={styles.bubble} cx={width * (.23 + bubble * .25)} cy={94 - bubble * 12} r={3 + bubble} style={{ animationDelay: `${bubble * -.6}s` }} />)}
                  </g>
                </g>
                <text {...textProps} className={styles.rim}>{letter}</text>
                  </g>;
                })}
              </svg>
            </div>
          );
        })}
      </div>
      <div className={styles.reflection} aria-hidden="true" />
      <button type="button" className={styles.skip} onClick={onComplete}>Bỏ qua ›</button>
    </div>
  );
}
