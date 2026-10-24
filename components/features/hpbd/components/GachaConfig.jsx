"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../styles/GachaConfig.module.scss";

const DEFAULT_CONFIG = {
  special_threshold: 30,
  special_start_roll: 21,
  special_guaranteed_roll: 25,
};

export default function GachaConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [progress, setProgress] = useState({
    roll_count: 0,
    special_won: false,
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/gacha/admin/config", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không tải được cấu hình");
      }

      setConfig({
        special_threshold: data.config.special_threshold,
        special_start_roll: data.config.special_start_roll,
        special_guaranteed_roll:
          data.config.special_guaranteed_roll,
      });

      setProgress(data.progress);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  function updateField(name, value) {
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function sendRequest(method, body) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/gacha/admin/config", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Thao tác thất bại");
      }

      if (data.config) {
        setConfig({
          special_threshold: data.config.special_threshold,
          special_start_roll: data.config.special_start_roll,
          special_guaranteed_roll:
            data.config.special_guaranteed_roll,
        });
      }

      if (data.progress) {
        setProgress(data.progress);
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    const threshold = Number(config.special_threshold);
    const start = Number(config.special_start_roll);
    const guarantee = Number(config.special_guaranteed_roll);

    if (
      !Number.isFinite(threshold) ||
      threshold <= 0 ||
      threshold > 100 ||
      !Number.isInteger(start) ||
      start < 1 ||
      !Number.isInteger(guarantee) ||
      guarantee < start
    ) {
      setError("Vui lòng nhập cấu hình hợp lệ.");
      return;
    }

    const success = await sendRequest("PUT", {
      special_threshold: threshold,
      special_start_roll: start,
      special_guaranteed_roll: guarantee,
    });

    if (success) {
      setMessage("Đã lưu cấu hình thành công!");
    }
  }

  async function handleResetConfig() {
    const confirmed = window.confirm(
      "Bạn muốn khôi phục cấu hình mặc định (30 / 21 / 25)?"
    );

    if (!confirmed) return;

    const success = await sendRequest("POST", {
      action: "reset_config",
    });

    if (success) {
      setMessage("Đã khôi phục cấu hình mặc định!");
    }
  }

  async function handleResetProgress() {
    const confirmed = window.confirm(
      "Bạn có chắc muốn reset toàn bộ lượt quay về 0?\n\n" +
        "Trạng thái đã trúng quà đặc biệt cũng sẽ được xóa."
    );

    if (!confirmed) return;

    const success = await sendRequest("POST", {
      action: "reset_progress",
    });

    if (success) {
      setMessage("Đã reset lượt quay về 0!");
    }
  }

  if (loading) {
    return (
      <div className={styles.panel}>
        <p>Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>GACHA SETTINGS</span>
          <h2>🎁 Cấu hình quà đặc biệt</h2>
          <p>
            Tùy chỉnh điều kiện xuất hiện và cơ chế đảm bảo
            trúng quà đặc biệt.
          </p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>Tổng lượt đã quay</span>
          <strong>{progress.roll_count}</strong>
        </div>

        <div className={styles.stat}>
          <span>Đã trúng quà đặc biệt</span>
          <strong>
            {progress.special_won ? "Đã trúng ✨" : "Chưa trúng"}
          </strong>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Ngưỡng quà đặc biệt</span>
            <input
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              value={config.special_threshold}
              onChange={(e) =>
                updateField(
                  "special_threshold",
                  e.target.value
                )
              }
              disabled={busy}
              required
            />
            <small>
              Quà có trọng số thấp hơn ngưỡng này được tính
              là quà đặc biệt.
            </small>
          </label>

          <label className={styles.field}>
            <span>Bắt đầu mở khóa từ lượt</span>
            <input
              type="number"
              min="1"
              step="1"
              value={config.special_start_roll}
              onChange={(e) =>
                updateField(
                  "special_start_roll",
                  e.target.value
                )
              }
              disabled={busy}
              required
            />
            <small>
              Từ lượt này, quà đặc biệt có cơ hội xuất hiện.
            </small>
          </label>

          <label className={styles.field}>
            <span>Đảm bảo trúng ở lượt</span>
            <input
              type="number"
              min="1"
              step="1"
              value={config.special_guaranteed_roll}
              onChange={(e) =>
                updateField(
                  "special_guaranteed_roll",
                  e.target.value
                )
              }
              disabled={busy}
              required
            />
            <small>
              Nếu chưa trúng quà đặc biệt, lượt này sẽ được
              đảm bảo.
            </small>
          </label>
        </div>

        <div className={styles.preview}>
          <strong>✨ Xem trước cơ chế</strong>
          <p>
            Lượt 1–
            {Math.max(
              0,
              Number(config.special_start_roll) - 1
            )}
            : chỉ quà thường.
          </p>
          <p>
            Từ lượt {config.special_start_roll}: có cơ hội
            trúng quà đặc biệt.
          </p>
          <p>
            Lượt {config.special_guaranteed_roll}: đảm bảo
            trúng nếu chưa trúng trước đó.
          </p>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={busy}
          >
            {busy ? "Đang xử lý..." : "💾 Lưu cấu hình"}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleResetConfig}
            disabled={busy}
          >
            ↺ Reset cấu hình
          </button>

          <button
            type="button"
            className={styles.dangerButton}
            onClick={handleResetProgress}
            disabled={busy}
          >
            🗑 Reset lượt quay
          </button>
        </div>
      </form>
    </section>
  );
}