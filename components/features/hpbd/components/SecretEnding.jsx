"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { journey } from "../utils/data/journey";
import styles from "../styles/SecretEnding.module.scss";

function JourneyDialog({ onClose }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [phase, setPhase] = useState("intro");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const previouslyFocused = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    const timer = window.setTimeout(() => setReady(true), reduceMotion ? 0 : 6000);
    return () => {
      window.clearTimeout(timer);
      video?.pause();
      dialog.close();
      document.body.style.overflow = overflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [reduceMotion]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const play = () => {
    if (!journey.videoSrc) return;
    setError(false);
    setRevealing(!reduceMotion);
    setPhase("video");
    const video = videoRef.current;
    if (video.error) video.load();
    video.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
  };

  const replay = () => {
    videoRef.current.currentTime = 0;
    play();
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="journey-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      data-phase={phase}
    >
      <div className={styles.shell} data-lenis-prevent>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng hành trình">×</button>
        <div className={styles.stars} aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ left: `${(index * 37 + 9) % 100}%`, top: `${(index * 23 + 7) % 100}%`, animationDelay: `${index * -0.3}s` }} />)}
        </div>
        <h2 id="journey-title" className={styles.srOnly}>{journey.title}</h2>

        {/* Keep one video element mounted so replay preserves its buffer. */}
        <div
          className={styles.player}
          hidden={phase === "intro"}
          data-revealing={revealing && !reduceMotion && phase === "video"}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setRevealing(false);
          }}
        >
          <div className={styles.filmFrame}>
          <video
            ref={videoRef}
            src={journey.videoSrc || undefined}
            poster={journey.poster}
            preload={journey.videoSrc ? "metadata" : "none"}
            controls={phase === "video" && (!revealing || reduceMotion)}
            playsInline
            aria-label="Video hành trình yêu xa của chúng mình"
            onEnded={() => setPhase("finale")}
            onError={() => { if (journey.videoSrc) setError(true); }}
          />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro" className={styles.intro} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }} transition={{ duration: reduceMotion ? 0 : 0.45 }}>
              <span className={styles.eyebrow}>ONE MORE LITTLE SECRET</span>
              <div className={styles.connection} aria-hidden="true">
                <svg viewBox="0 0 400 130">
                  <motion.path d="M35 95 Q200 -45 365 95" fill="none" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut" }} />
                  <circle cx="35" cy="95" r="5" /><circle cx="365" cy="95" r="5" />
                </svg>
                <span>♡</span>
                <small>Anh</small><small>Em</small>
              </div>
              <motion.p initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 0.6, duration: 1 }}>
                Có những ngày, chúng mình chỉ gặp nhau qua màn hình.
              </motion.p>
              <motion.p initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : 3.2, duration: 1 }}>
                Nhưng chưa ngày nào anh ngừng muốn ở gần em.
              </motion.p>
              {ready && (
                <motion.div className={styles.actions} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {journey.videoSrc ? <button type="button" onClick={play}>Xem hành trình của chúng mình ♡</button> : (
                    <>
                      <p className={styles.note}>Thước phim của chúng mình đang được anh cất giữ thêm một chút…</p>
                      <button type="button" onClick={() => setPhase("finale")}>Đọc lời hẹn của anh ♡</button>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "video" && (error || needsPlay) && (
            <div key="video-status" className={styles.videoStatus} role="status">
              <p>{error ? "Thước phim chưa mở được. Em thử lại nhé ♡" : "Chạm để tiếp tục hành trình ♡"}</p>
              <button type="button" onClick={play}>{error ? "Thử lại" : "Phát video"}</button>
              <button type="button" onClick={() => { videoRef.current.pause(); setPhase("finale"); }}>Đọc lời hẹn</button>
            </div>
          )}

          {phase === "finale" && (
            <motion.div key="finale" className={styles.finale} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : 1.2 }}>
              <div className={styles.reunion} aria-hidden="true"><i /><i /><span>♥</span></div>
              <span className={styles.eyebrow}>UNTIL WE MEET AGAIN</span>
              <p>Một ngày nào đó, mình sẽ không còn phải nói nhớ nhau qua màn hình nữa.</p>
              <h3>Hẹn em ở lần gặp tiếp theo, lần tới hãy về chung nhà với dh em nhé ♡</h3>
              <div className={styles.actions}>
                {journey.videoSrc && <button type="button" onClick={replay}>Xem lại hành trình</button>}
                <button type="button" onClick={onClose}>Trở về với chúng mình</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </dialog>, document.body,
  );
}

export default function SecretEnding({ onActiveChange }) {
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    let timer;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      if (entry.intersectionRatio >= 0.5) timer = window.setTimeout(() => {
        setUnlocked(true);
        observer.disconnect();
      }, 5000);
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!open) return;
    onActiveChange?.(true);
    return () => onActiveChange?.(false);
  }, [open, onActiveChange]);

  return (
    <div ref={ref} className={styles.secret}>
      {unlocked && <motion.button ref={triggerRef} type="button" className={styles.invitation} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setOpen(true)}>
        <span className={styles.secretHeart} aria-hidden="true">♡</span>
        <span>Chưa hết đâu em, Dinhhung vẫn còn một điều bí mật nè…</span>
        <small>Chạm vào tim để xem em nhé</small>
      </motion.button>}
      {open && <JourneyDialog onClose={close} />}
    </div>
  );
}
