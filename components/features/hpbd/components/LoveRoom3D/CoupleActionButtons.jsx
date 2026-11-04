"use client";

import styles from "../../styles/LoveRoom3D.module.scss";

const ACTIONS = [
  { id: "wave", label: "👋 Vẫy tay" },
  { id: "hold", label: "🫶 Khoắc vai" },
  { id: "dance", label: "💃 Nhảy vui" },
  { id: "kiss", label: "😘 Hôn gió" },
  { id: "hug", label: "❤️ Ôm nhau" },
  { id: "idle", label: "↩ Đứng lại" },
];

export default function CoupleActionButtons({
  value,
  disabled = false,
  onSelect,
}) {
  return (
    <div
      className={styles.actionButtons}
      style={{
        display: disabled ? "none" : "flex",
      }}
    >
      {ACTIONS.map((action) => {
        const selected = value === action.id;

        return (
          <button
            type="button"
            key={action.id}
            disabled={disabled}
            onClick={() => onSelect?.(action.id)}
            style={{
              borderRadius: 999,
              border: selected
                ? "1px solid #ff80b5"
                : "1px solid rgba(255,190,220,.35)",
              background: selected
                ? "linear-gradient(135deg,#ff96bf,#eab2df)"
                : "rgba(55,32,75,.84)",
              color: selected ? "#47243b" : "#fff",
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.45 : 1,
              transition: "background .2s, transform .2s",
            }}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
