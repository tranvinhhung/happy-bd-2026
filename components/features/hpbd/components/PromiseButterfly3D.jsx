"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "../styles/PromiseButterfly3D.module.scss";

const PromiseButterflyCanvas = dynamic(
  () => import("./PromiseButterflyCanvas"),
  { ssr: false }
);

export default function PromiseButterfly3D({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const [textVisible, setTextVisible] = useState(false);

  const handleTextReveal = useCallback(() => {
    setTextVisible(true);
  }, []);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTextVisible(false);
      return;
    }

    if (reduceMotion) {
      setTextVisible(true);
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, reduceMotion, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Hiệu ứng hoàn thành lời hứa"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          onClick={(event) => {
            if (textVisible && event.target === event.currentTarget) {
              onClose?.();
            }
          }}
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng hiệu ứng"
          >
            ✕ Đóng
          </button>

          {!reduceMotion && (
            <div className={styles.canvasContainer}>
              <PromiseButterflyCanvas
                onTextReveal={handleTextReveal}
                onComplete={handleTextReveal}
              />
            </div>
          )}

          <AnimatePresence>
            {textVisible && (
              <motion.div
                className={styles.messageBox}
                initial={{ opacity: 0, scale: 0.88, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.eyebrow}>OUR PROMISES SEALED ✦</span>
                <h3 className={styles.title}>
                  Năm lời hứa, một điều không đổi:
                  <strong>Anh luôn chọn em. ♡</strong>
                </h3>
                <button
                  type="button"
                  className={styles.continueBtn}
                  onClick={onClose}
                >
                  Tiếp tục hành trình ♡
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
