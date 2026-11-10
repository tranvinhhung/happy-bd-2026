"use client";

import { useSyncExternalStore } from "react";

const KEY = "birthday-room-mode";
const EVENT = "birthday-room-mode-change";
let fallback = "3d";

const read = () => {
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved === "2d" || saved === "3d" ? saved : fallback;
  }
  catch { return fallback; }
};
const subscribe = (listener) => {
  window.addEventListener("storage", listener);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(EVENT, listener);
  };
};
const serverMode = () => "3d";

export default function useRoomMode() {
  const mode = useSyncExternalStore(subscribe, read, serverMode);
  const setMode = (nextMode) => {
    fallback = nextMode;
    try { window.localStorage.setItem(KEY, nextMode); } catch { /* Keep the choice for this visit. */ }
    window.dispatchEvent(new Event(EVENT));
  };
  return [mode, setMode];
}
