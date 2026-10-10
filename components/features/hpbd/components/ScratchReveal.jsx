
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

const REVEAL_THRESHOLD = 0.55;
const BRUSH_SIZE = 32;

export default function ScratchReveal() {
  const canvasRef = useRef(null);
  const surfaceRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const revealedRef = useRef(false);
  const checkFrameRef = useRef(null);
  const lastCheckRef = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const reduceMotion = useReducedMotion();

  const completeReveal = useCallback(() => {
    if (revealedRef.current) return;

    revealedRef.current = true;
    drawingRef.current = false;
    setProgress(100);
    setRevealed(true);
  }, []);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;

    if (!canvas || !surface || revealedRef.current) return;

    const rect = surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const gradient = ctx.createLinearGradient(
      0,
      0,
      rect.width,
      rect.height
    );

    gradient.addColorStop(0, "#fce1e9");
    gradient.addColorStop(0.5, "#e8aebe");
    gradient.addColorStop(1, "#f7cbd8");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Những hạt sáng nhỏ trên lớp phủ
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const radius = Math.random() * 1.5 + 0.5;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fill();
    }

    ctx.fillStyle = "#a85575";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "500 14px Arial";
    ctx.fillText(
      "CÀO NHẸ ĐỂ MỞ BÍ MẬT",
      rect.width / 2,
      rect.height / 2 - 16
    );

    ctx.font = "32px Arial";
    ctx.fillText(
      "♡",
      rect.width / 2,
      rect.height / 2 + 27
    );
  }, []);

  useEffect(() => {
    revealedRef.current = false;
    drawingRef.current = false;
    lastPointRef.current = null;

    const surface = surfaceRef.current;
    if (!surface) return;

    initializeCanvas();

    const observer = new ResizeObserver(() => {
      // Nếu thay đổi kích thước khi đang cào,
      // canvas sẽ được vẽ lại.
      if (!revealedRef.current) {
        initializeCanvas();
        setProgress(0);
      }
    });

    observer.observe(surface);

    return () => {
      observer.disconnect();

      if (checkFrameRef.current !== null) {
        cancelAnimationFrame(checkFrameRef.current);
        checkFrameRef.current = null;
      }
    };
  }, [initializeCanvas, resetKey]);

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const erase = (from, to) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Một chấm để hỗ trợ cả thao tác chạm nhanh
    ctx.beginPath();
    ctx.arc(to.x, to.y, BRUSH_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const calculateProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return;

    const { width, height } = canvas;
    const pixels = ctx.getImageData(
      0,
      0,
      width,
      height
    ).data;

    let cleared = 0;
    let total = 0;

    // Lấy mẫu thay vì duyệt tất cả pixel
    const step = 8;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alphaIndex = (y * width + x) * 4 + 3;

        if (pixels[alphaIndex] < 50) {
          cleared++;
        }

        total++;
      }
    }

    const ratio = total ? cleared / total : 0;

    setProgress(Math.min(100, Math.round(ratio * 100)));

    if (ratio >= REVEAL_THRESHOLD) {
      completeReveal();
    }
  };

  const scheduleProgressCheck = () => {
    const now = performance.now();

    // Không đọc pixel quá thường xuyên
    if (now - lastCheckRef.current < 180) return;

    lastCheckRef.current = now;

    if (checkFrameRef.current !== null) return;

    checkFrameRef.current = requestAnimationFrame(() => {
      checkFrameRef.current = null;
      calculateProgress();
    });
  };

  const handlePointerDown = (event) => {
    if (revealedRef.current) return;

    event.preventDefault();

    drawingRef.current = true;

    const point = getPoint(event);
    lastPointRef.current = point;

    event.currentTarget.setPointerCapture(event.pointerId);

    erase(point, point);
    scheduleProgressCheck();
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current || revealedRef.current) return;

    const point = getPoint(event);
    const previous = lastPointRef.current || point;

    erase(previous, point);
    lastPointRef.current = point;

    scheduleProgressCheck();
  };

  const handlePointerUp = (event) => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    lastPointRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    calculateProgress();
  };

  const handleReset = () => {
    revealedRef.current = false;
    drawingRef.current = false;
    lastPointRef.current = null;
    lastCheckRef.current = 0;

    setRevealed(false);
    setProgress(0);
    setResetKey((key) => key + 1);
  };

  return (
    <section className="scratch-reveal">
      <div className="scratch-reveal__inner">
        <motion.div
          className="scratch-reveal__heading"
          initial={reduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <span className="scratch-reveal__eyebrow">
            A LITTLE SURPRISE
          </span>

          <h2>
            Một điều <em>bí mật</em>
            <br />
            dành cho em ♡
          </h2>

          <p>
            Có một lời nhắn nhỏ đang chờ em khám phá.
            <br />
            Dùng ngón tay cào nhẹ tấm thiệp em nhé!
          </p>
        </motion.div>

        <motion.div
          className="scratch-reveal__frame"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div
            ref={surfaceRef}
            className="scratch-reveal__surface"
          >
            <div className="scratch-reveal__secret">
              <span className="scratch-reveal__secret-label">
                YOU ARE MY FAVORITE GIFT
              </span>

              <motion.div
                className="scratch-reveal__secret-heart"
                animate={
                  revealed && !reduceMotion
                    ? { scale: [1, 1.12, 1] }
                    : {}
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ♥
              </motion.div>

              <h3>
                Điều tuyệt vời nhất
                <br />
                chính là có em!
              </h3>

              <p>
                Chúc em tuổi mới luôn hạnh phúc,
                bình an và có thật nhiều
                khoảnh khắc đáng nhớ. ♡
              </p>
            </div>

            <AnimatePresence>
              {!revealed && (
                <motion.canvas
                  key={`scratch-${resetKey}`}
                  ref={canvasRef}
                  className="scratch-reveal__canvas"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: reduceMotion ? 0 : 0.8 }}
                  aria-label="Cào để mở lời nhắn bí mật"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  className="scratch-reveal__celebration"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  aria-hidden="true"
                >
                  {Array.from({ length: 10 }, (_, index) => (
                    <motion.span
                      key={index}
                      className="scratch-reveal__particle"
                      style={{
                        left: `${10 + index * 9}%`,
                        top: `${20 + (index % 4) * 18}%`,
                      }}
                      initial={{ opacity: 0, scale: 0.3, y: 15 }}
                      animate={
                        reduceMotion
                          ? { opacity: 0 }
                          : {
                              opacity: [0, 1, 0],
                              scale: [0.3, 1, 0.5],
                              y: [15, -20, -50],
                            }
                      }
                      transition={{
                        duration: 1.8,
                        delay: index * 0.08,
                      }}
                    >
                      {index % 2 === 0 ? "♥" : "✦"}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="scratch-reveal__bottom">
          {!revealed ? (
            <>
              <div className="scratch-reveal__progress">
                <motion.div
                  className="scratch-reveal__progress-fill"
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <span className="scratch-reveal__progress-text">
                Đã cào {progress}% · Mở khóa ở 55%
              </span>

              <button
                type="button"
                className="scratch-reveal__skip"
                onClick={completeReveal}
              >
                Không cào được? Mở bí mật tại đây ♡
              </button>
            </>
          ) : (
            <motion.div
              className="scratch-reveal__finished"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>Em đã mở được điều bí mật rồi! ♡</p>

              <button type="button" onClick={handleReset}>
                <span>↻</span> Cào lại một lần nữa
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
