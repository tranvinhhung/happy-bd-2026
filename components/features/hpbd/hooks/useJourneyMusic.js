"use client";

import { useCallback, useEffect, useRef } from "react";

export default function useJourneyMusic(audioRef) {
  const frameRef = useRef(null);
  const savedRef = useRef(null);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return useCallback((active) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(frameRef.current);

    const fade = (target, duration, complete) => {
      const start = performance.now();
      const initial = audio.volume;
      const tick = (now) => {
        const progress = Math.max(0, Math.min(1, (now - start) / duration));
        audio.volume = initial + (target - initial) * progress;
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        else complete?.();
      };
      frameRef.current = requestAnimationFrame(tick);
    };

    if (active) {
      savedRef.current = { playing: !audio.paused, volume: audio.volume };
      fade(0, 500, () => audio.pause());
    } else {
      const saved = savedRef.current;
      savedRef.current = null;
      if (!saved) return;
      if (saved.playing) {
        audio.play().then(() => fade(saved.volume, 800)).catch(() => { audio.volume = saved.volume; });
      } else audio.volume = saved.volume;
    }
  }, [audioRef]);
}
