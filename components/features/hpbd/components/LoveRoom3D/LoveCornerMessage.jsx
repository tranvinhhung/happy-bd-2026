
"use client";

import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = {
  photo: "Mỗi bức ảnh là một khoảnh khắc anh muốn giữ mãi. 📸",
  shelf: "Một chú gấu nhỏ dành riêng cho em. 🧸",
  teddy: "Nếu hôm nay em mệt, anh sẽ ôm em thật lâu. ♡",
  flower: "Mong nụ cười của em luôn rực rỡ như những bông hoa. 🌷",
  neon: "Love you, today and every day. 💗",
};

export default function LoveCornerMessage({
  active,
  onClose,
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 15, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 25,
            maxWidth: "calc(100% - 30px)",
            padding: "14px 20px",
            borderRadius: 18,
            background: "rgba(39, 21, 55, 0.88)",
            border: "1px solid rgba(255, 190, 220, 0.35)",
            color: "#ffe6f0",
            backdropFilter: "blur(12px)",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,.2)",
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {MESSAGES[active] || "Một chút yêu thương dành cho em. ♡"}
          </p>

          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 8,
              border: "none",
              background: "transparent",
              color: "#ffc2da",
              cursor: "pointer",
            }}
          >
            Đóng ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
