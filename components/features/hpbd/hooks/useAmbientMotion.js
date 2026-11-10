"use client";

import { useSyncExternalStore } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const subscribe = (listener) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};
const getVisible = () => document.visibilityState === "visible";
const getServerVisible = () => true;

export function usePageVisible() {
  return useSyncExternalStore(subscribe, getVisible, getServerVisible);
}

export default function useAmbientMotion(ref) {
  const inView = useInView(ref, { amount: "some" });
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  return inView && pageVisible && !reducedMotion;
}
