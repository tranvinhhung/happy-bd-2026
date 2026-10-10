
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import "./login.scss";

export default function BirthdayLogin() {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUnlock = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Thử lại nhé ♡");
        return;
      }

      setSuccess(true);

      // Chuyển trang sau khi hiệu ứng hoàn thành
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 1100);
    } catch {
      setError("Có lỗi xảy ra, thử lại nhé ♡");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="birthday-login">
      <div className="birthday-login__stars" />

      <motion.div
        className="birthday-login__card"
        initial={{ opacity: 0, y: 45, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className="birthday-login__heart"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ♡
        </motion.div>

        <span className="birthday-login__eyebrow">
          A LITTLE SECRET FOR YOU
        </span>

        <h1>
          Trước khi mở
          <br />
          món quà này...
        </h1>

        <p className="birthday-login__description">
          Anh có một câu hỏi nhỏ dành riêng cho em.
        </p>

        <form onSubmit={handleUnlock}>
          <label htmlFor="secret-answer">
            Ngày chúng mình yêu nhau là ngày nào? (ngày của dinhhung nhé) ♡ 
          </label>

          <input
            id="secret-answer"
            type="text"
            placeholder="DD/MM/YYYY"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={success}
            autoComplete="off"
            required
          />

          {error && (
            <motion.p
              className="birthday-login__error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading || success}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {success
              ? "Đúng rồi! Đang mở quà ♡"
              : loading
                ? "Đang kiểm tra..."
                : "Mở khóa trái tim ♡"}
          </motion.button>
        </form>

        <span className="birthday-login__footer">
          made with love · just for you
        </span>
      </motion.div>
    </main>
  );
}
