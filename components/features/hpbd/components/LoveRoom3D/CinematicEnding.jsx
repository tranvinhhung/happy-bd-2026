
"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function CinematicEnding({
  active,
  showMessage,
  onReplay,
  onClose,
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="cinematic-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Viền điện ảnh */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 30 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "#170f27",
            }}
          />

          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 30 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#170f27",
            }}
          />

          <AnimatePresence>
            {showMessage && (
              <motion.div
                key="cinematic-message"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                  padding: "20px 16px 72px",
                  textAlign: "center",
                  background:
                    "linear-gradient(transparent 35%, rgba(20, 9, 35, 0.8))",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  style={{ fontSize: 42 }}
                >
                  💗
                </motion.div>

                <h2
                  style={{
                    margin: "12px 0 0",
                    color: "#ffe0ee",
                    fontSize: "clamp(22px, 5vw, 42px)",
                    textShadow:
                      "0 0 25px rgba(255, 125, 180, 0.6)",
                  }}
                >
                  Happy Birthday, My Love ♡
                </h2>

                <p
                  style={{
                    color: "#fff1f7",
                    lineHeight: 1.8,
                    fontSize: "clamp(13px, 2vw, 17px)",
                    maxWidth: 520,
                    margin: "14px 0",
                  }}
                >
                  Cảm ơn em vì đã đến bên anh.
                  <br />
                  Mong rằng mỗi sinh nhật sau này,
                  <br />
                  chúng mình vẫn luôn có nhau. ♡
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 10,
                    marginTop: 15,
                    pointerEvents: "auto",
                  }}
                >
                  <button
                    type="button"
                    onClick={onReplay}
                    style={{
                      padding: "11px 18px",
                      borderRadius: 999,
                      border: "none",
                      background: "#ff9dc5",
                      color: "#44263b",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ↻ Xem lại
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "11px 18px",
                      borderRadius: 999,
                      border: "1px solid #ffffff66",
                      background: "#ffffff22",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Quay lại phòng
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
