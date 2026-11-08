"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUp, Volume2, VolumeX, X } from "lucide-react";

const SIZE = 48;
const GAP = 10;
const clampY = (y) => Math.max(GAP, Math.min(y, (window.visualViewport?.height || window.innerHeight) - SIZE - GAP));

export default function MusicToggle({ playing, onToggle, error }) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState({ below: false, space: 280 });
  const panelId = useId();
  const edge = position?.edge || "right";

  const measureMenu = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const below = rect.top < viewportHeight - rect.bottom;
    setMenu({ below, space: Math.max(80, (below ? viewportHeight - rect.bottom : rect.top) - 20) });
  };

  const closeMenu = () => {
    setOpen(false);
    setExpanded(false);
    buttonRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const resize = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition((current) => ({ edge: current?.edge || "right", y: clampY(rect.top) }));
      setOpen(false);
      setExpanded(false);
    };
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    if (open) panelRef.current?.querySelector("button")?.focus({ preventScroll: true });
    const outside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setExpanded(false);
      }
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setExpanded(false);
        buttonRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [expanded, open]);

  const pointerDown = (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    const rect = rootRef.current.getBoundingClientRect();
    suppressClickRef.current = false;
    dragRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: rect.left, y: rect.top, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    setDragging(true);
    setExpanded(true);
    setOpen(false);
    setPosition({ edge, x: Math.max(GAP, Math.min(drag.x + dx, window.innerWidth - SIZE - GAP)), y: clampY(drag.y + dy) });
  };

  const pointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) {
      suppressClickRef.current = true;
      const rect = rootRef.current.getBoundingClientRect();
      setPosition({ edge: rect.left + SIZE / 2 < window.innerWidth / 2 ? "left" : "right", y: clampY(rect.top) });
      setExpanded(false);
    }
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="music-control-host">
    <div
      ref={rootRef}
      className="music-control"
      data-edge={edge}
      data-open={open}
      data-expanded={expanded}
      data-dragging={dragging}
      data-menu-below={menu.below}
      style={{
        top: position ? position.y : undefined,
        left: position?.x,
        right: position?.x !== undefined ? "auto" : undefined,
        "--quick-menu-space": `${menu.space}px`,
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="music-control__button"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onClick={() => {
          if (suppressClickRef.current) { suppressClickRef.current = false; return; }
          if (!expanded) { setExpanded(true); return; }
          if (open) { closeMenu(); return; }
          measureMenu();
          setOpen(true);
        }}
        aria-label={expanded ? "Mở tùy chọn nhanh" : "Hiện nút tùy chọn nhanh"}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        title={expanded ? "Chạm để mở tùy chọn, kéo để đổi vị trí" : "Chạm để hiện nút, kéo để đổi vị trí"}
      >
        <span className="music-control__dot" aria-hidden="true" />
      </button>

      {open && (
        <div ref={panelRef} id={panelId} className="music-control__panel" role="dialog" aria-label="Tùy chọn nhanh" data-lenis-prevent>
          <div className="music-control__header">
            <span>Tùy chọn nhanh</span>
            <button type="button" onClick={closeMenu} aria-label="Đóng tùy chọn"><X size={18} aria-hidden="true" /></button>
          </div>
          <button type="button" className="music-control__action" onClick={() => { onToggle(); closeMenu(); }} aria-pressed={playing}>
            {playing ? <VolumeX size={21} aria-hidden="true" /> : <Volume2 size={21} aria-hidden="true" />}
            <span>{playing ? "Tắt nhạc nền" : "Bật nhạc nền"}</span>
          </button>
          <a className="music-control__action" href="#birthday-top" onClick={closeMenu}>
            <ArrowUp size={21} aria-hidden="true" /><span>Về đầu trang</span>
          </a>
          {error && <span className="music-control__error" role="status">Chưa phát được nhạc. Em thử bật lại nhé.</span>}
        </div>
      )}
    </div>
    </div>
  );
}
