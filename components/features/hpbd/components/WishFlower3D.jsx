"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "../styles/WishFlower3D.module.scss";

const WishFlowerCanvas = dynamic(() => import("./WishFlowerCanvas"), {
  ssr: false,
});

function IllustratedBoyArm() {
  return (
    <svg
      className={styles.armBoySvg}
      viewBox="0 0 500 400"
      preserveAspectRatio="xMaxYMin meet"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="boySkin" x1="160" y1="300" x2="465" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d4987d" />
          <stop offset="55%" stopColor="#eebda4" />
          <stop offset="100%" stopColor="#fad8c4" />
        </linearGradient>
        <linearGradient id="boySleeve" x1="-320" y1="680" x2="260" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7b7d4" />
          <stop offset="52%" stopColor="#d7e2f2" />
          <stop offset="100%" stopColor="#f5f9ff" />
        </linearGradient>
      </defs>

      {/* Tay áo sơ mi kéo dài ngập sát mép dưới-trái để luôn liền mạch */}
      <path
        d="M-420 760 L205 225 C224 209 252 234 268 262 C276 278 262 298 242 313 L-260 880 Z"
        fill="url(#boySleeve)"
      />
      <path
        d="M196 232 C220 220 248 246 260 274"
        stroke="rgba(155, 175, 208, 0.55)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Cổ tay & bàn tay nam thon gọn, cong mềm đưa hoa */}
      <path
        d="M222 232 L344 134 C362 120 385 106 408 98 C428 91 452 94 459 105 C465 114 447 125 426 128 C446 124 470 127 474 139 C477 149 457 157 433 156 C453 157 468 167 466 178 C463 188 442 191 419 186 C433 191 443 201 438 210 C432 219 408 217 385 209 C364 203 338 208 264 276 Z"
        fill="url(#boySkin)"
      />

      {/* Ngón cái khum ôm thân hoa */}
      <path
        d="M350 135 C370 106 402 86 426 90 C440 93 443 106 428 118 C413 130 392 138 374 149"
        fill="url(#boySkin)"
        stroke="rgba(190, 124, 98, 0.36)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Đường nét khớp ngón nhẹ nhàng */}
      <path
        d="M408 129 C419 128 428 128 435 129 M412 156 C422 156 429 156 435 157 M402 182 C411 183 417 185 422 187"
        stroke="rgba(190, 124, 98, 0.32)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IllustratedGirlArm() {
  return (
    <svg
      className={styles.armGirlSvg}
      viewBox="0 0 500 400"
      preserveAspectRatio="xMinYMax meet"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="girlSkin" x1="340" y1="100" x2="45" y2="355" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eebca6" />
          <stop offset="55%" stopColor="#fad5c4" />
          <stop offset="100%" stopColor="#ffe7dc" />
        </linearGradient>
        <linearGradient id="girlSleeve" x1="820" y1="-260" x2="250" y2="195" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ec9ec0" />
          <stop offset="52%" stopColor="#ffd3e5" />
          <stop offset="100%" stopColor="#fff2f7" />
        </linearGradient>
        <linearGradient id="goldBracelet" x1="230" y1="145" x2="278" y2="202" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff5cf" />
          <stop offset="50%" stopColor="#f6c77e" />
          <stop offset="100%" stopColor="#ffe9b8" />
        </linearGradient>
      </defs>

      {/* Tay áo voan hồng pastel kéo dài ngập sát mép trên-phải để luôn liền mạch */}
      <path
        d="M920 -360 L292 168 C274 182 248 156 236 128 C228 110 242 91 262 76 L760 -480 Z"
        fill="url(#girlSleeve)"
      />

      {/* Cổ tay & bàn tay nữ thon thả, cong nhẹ từ trên cao xuống */}
      <path
        d="M282 158 L162 252 C144 265 120 278 98 283 C76 288 54 283 49 272 C44 263 62 253 84 252 C64 255 41 249 38 237 C36 227 56 220 80 222 C60 220 46 210 50 199 C53 190 74 188 96 195 C82 189 74 179 79 170 C86 161 109 166 130 175 C150 183 176 180 242 114 Z"
        fill="url(#girlSkin)"
      />

      {/* Ngón cái thon */}
      <path
        d="M156 252 C136 280 105 298 82 292 C69 289 67 276 82 265 C97 254 118 247 136 237"
        fill="url(#girlSkin)"
        stroke="rgba(205, 142, 122, 0.32)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Lắc tay vàng hồng tinh tế ở cổ tay */}
      <path
        d="M238 119 C256 133 271 150 277 165"
        stroke="url(#goldBracelet)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="266" cy="146" r="5" fill="#fff4d2" />
    </svg>
  );
}

export default function WishFlower3D({ open, onClose }) {
  const reducedMotion = useReducedMotion();
  const [textVisible, setTextVisible] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const handleTextReveal = useCallback(() => {
    setTextVisible(true);
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleClose = useCallback(() => {
    setTextVisible(false);
    setSceneReady(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  const showMessage = Boolean(open && (textVisible || reducedMotion));

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Hiệu ứng trao hoa lời chúc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          onClick={(event) => {
            if (showMessage && event.target === event.currentTarget) {
              handleClose();
            }
          }}
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Đóng hiệu ứng"
          >
            ✕ Đóng
          </button>

          {!reducedMotion && (
            <>
              {/* Cánh tay minh họa nghệ thuật cong mượt từ mép dưới-trái và mép trên-phải */}
              <div className={styles.armsStage} aria-hidden="true">
                <motion.div
                  className={styles.armBoyWrap}
                  initial={{ rotate: 24, opacity: 0 }}
                  animate={
                    sceneReady
                      ? {
                          rotate: [24, 0, -0.5],
                          opacity: [0, 1, 0.5],
                        }
                      : { rotate: 24, opacity: 0 }
                  }
                  transition={{
                    duration: 6.2,
                    times: [0, 0.37, 1],
                    ease: ["easeInOut", "easeInOut"],
                  }}
                >
                  <IllustratedBoyArm />
                </motion.div>

                <motion.div
                  className={styles.armGirlWrap}
                  initial={{ rotate: 24, opacity: 0 }}
                  animate={
                    sceneReady
                      ? {
                          rotate: [24, 24, 0, -0.5],
                          opacity: [0, 0, 1, 0.5],
                        }
                      : { rotate: 24, opacity: 0 }
                  }
                  transition={{
                    duration: 6.2,
                    times: [0, 0.34, 0.68, 1],
                    ease: ["linear", "easeInOut", "easeInOut"],
                  }}
                >
                  <IllustratedGirlArm />
                </motion.div>

                <motion.div
                  className={styles.touchGlow}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={
                    sceneReady
                      ? { opacity: [0, 0, 0.9, 0.4], scale: [0.4, 0.4, 1.35, 1.1] }
                      : { opacity: 0, scale: 0.4 }
                  }
                  transition={{ duration: 6.2, times: [0, 0.6, 0.78, 1], ease: "easeInOut" }}
                />
              </div>

              <div className={styles.canvasContainer}>
                <WishFlowerCanvas
                  onTextReveal={handleTextReveal}
                  onReady={handleSceneReady}
                />
              </div>
            </>
          )}

          <AnimatePresence>
            {showMessage && (
              <motion.div
                className={styles.messageBox}
                initial={{ opacity: 0, scale: 0.88, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.stoneLead}>
                  ♡ Và trong tất cả những lời chúc ấy,
                </span>
                <p className={styles.messageTitle}>
                  <strong>
                    anh mong tình yêu tụi mình ngày càng bền chặt, và trong tim tụi mình luôn có nhau.
                  </strong>
                </p>
                <button
                  type="button"
                  className={styles.continueBtn}
                  onClick={handleClose}
                >
                  Cất vào tim ♡
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
