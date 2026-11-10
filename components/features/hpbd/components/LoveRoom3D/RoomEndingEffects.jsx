"use client";

import { useId } from "react";
import RoomBalloon from "./RoomBalloon";
import styles from "../../styles/RoomEndingEffects.module.scss";

const BALLOON_COLORS = ["#eca8c5", "#f4d49b", "#c4ade5", "#a9d2d0"];

export default function RoomEndingEffects({ messageVisible, active, compact }) {
  const gradientId = `room-ending-heart-${useId().replace(/:/g, "")}`;

  return (
    <div className={styles.endingVisual} data-message-visible={messageVisible} data-active={active} data-compact={compact} aria-hidden="true">
      <div className={styles.releasedBalloons} data-room-balloons="ending">
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            className={styles.releasedBalloon}
            style={{ left: `${3 + index * 13}%`, "--flight": `${6.5 + (index % 3) * 0.8}s`, "--delay": `${index * -0.85}s`, "--drift": `${index % 2 ? 24 : -24}px` }}
          >
            <RoomBalloon color={BALLOON_COLORS[index % BALLOON_COLORS.length]} />
          </span>
        ))}
      </div>
      <div className={styles.endingHeartPosition} data-room-ending-heart>
        <div className={styles.endingHeartReveal}>
          <div className={styles.endingHeartFloat}>
            <span className={styles.endingHeartHalo} />
            <span className={`${styles.endingHeartHalo} ${styles.endingHeartHaloDelayed}`} />
            <svg viewBox="0 0 200 190" className={styles.endingHeartShape}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffccdf" />
                  <stop offset=".48" stopColor="#ed82b4" />
                  <stop offset="1" stopColor="#ba518f" />
                </linearGradient>
              </defs>
              <path d="M100 174 C82 158 18 116 18 67 C18 23 70 10 100 46 C130 10 182 23 182 67 C182 116 118 158 100 174Z" fill={`url(#${gradientId})`} stroke="#ffd7e8" strokeWidth="2" />
              <path d="M34 61 C36 37 63 31 78 44" fill="none" stroke="#fff0f7" strokeWidth="7" strokeLinecap="round" opacity=".65" />
              <path d="M125 143 Q158 115 165 92" fill="none" stroke="#ffbad8" strokeWidth="3" strokeLinecap="round" opacity=".55" />
            </svg>
            <span className={`${styles.endingSpark} ${styles.endingSparkOne}`}>✦</span>
            <span className={`${styles.endingSpark} ${styles.endingSparkTwo}`}>✧</span>
            <span className={`${styles.endingSpark} ${styles.endingSparkThree}`}>♡</span>
          </div>
        </div>
      </div>
    </div>
  );
}

