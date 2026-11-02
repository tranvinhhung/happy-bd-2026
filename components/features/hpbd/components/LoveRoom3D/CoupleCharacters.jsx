"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";

import AnimatedCharacter from "./AnimatedCharacter";
import KissHeartEffect from "./KissHeartEffect";

const BOY_URL = "/images/love-room/boyfriend.glb";
const GIRL_URL = "/images/love-room/girlfriend.glb";

const START_DISTANCE = 0.95;
const HUG_DISTANCE = 0.45;
const HOLD_DISTANCE = 0.5;
const FACING_DIRECTION = 1;

function MovingChibi({
  url,
  side,
  mode,
  animation,
  replayKey,
  onClick,
  onArrived,
}) {
  const groupRef = useRef(null);
  const arrivedRef = useRef(false);

  const isBoy = side === "boy";
  const direction = isBoy ? -1 : 1;

  const startX = direction * START_DISTANCE;

  useEffect(() => {
    arrivedRef.current = false;
  }, [mode]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    let targetX = startX;
    let targetRotation = 0;

    if (mode === "hug") {
      targetX = direction * HUG_DISTANCE;

      targetRotation = ((isBoy ? 1 : -1) * FACING_DIRECTION * Math.PI) / 2;
    } else if (mode === "hold") {
      targetX = direction * HOLD_DISTANCE;
      targetRotation = (isBoy ? 1 : -1) * 0.3;
    } else if (mode === "kiss") {
      // Hai bé hơi nhìn về phía nhau khi hôn gió.
      targetRotation = (isBoy ? 1 : -1) * 0.25;
    }

    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      targetRotation,
      3.5,
      delta,
    );

    const rotationReady = Math.abs(group.rotation.y - targetRotation) < 0.12;

    // Khi ôm, xoay trước rồi mới tiến tới.
    if (mode !== "hug" || rotationReady) {
      group.position.x = MathUtils.damp(group.position.x, targetX, 3, delta);
    }

    const positionReady = Math.abs(group.position.x - targetX) < 0.025;

    const facingReady = Math.abs(group.rotation.y - targetRotation) < 0.08;

    if (mode === "hug" && positionReady && facingReady && !arrivedRef.current) {
      arrivedRef.current = true;
      onArrived?.(side);
    }
  });

  return (
    <group ref={groupRef} position={[startX, 0, 0]}>
      <AnimatedCharacter
        url={url}
        animation={animation}
        replayKey={replayKey}
        onClick={onClick}
      />
    </group>
  );
}

export default function CoupleCharacters({
  isHugging = false,
  onInteract,
  celebrate = false,

  cinematicActive = false,
  cinematicProgress = 0,
  cinematicResetKey = 0,

  coupleAction = null,
  coupleActionVersion = 0,
}) {
  const [hugReady, setHugReady] = useState(false);
  const [actionExpired, setActionExpired] = useState(false);
  const [celebratePlaying, setCelebratePlaying] = useState(false);
  const [clickedWave, setClickedWave] = useState(null);

  const arrivedRef = useRef({
    boy: false,
    girl: false,
  });

  const clickTimerRef = useRef(null);

  // Cinematic luôn được ưu tiên.
  const mode = cinematicActive
    ? cinematicProgress >= 2.5
      ? "hug"
      : "idle"
    : coupleAction === "idle"
      ? "idle"
      : coupleAction === "hug"
        ? "hug"
        : coupleAction === "hold"
          ? "hold"
          : coupleAction === "dance"
            ? "dance"
            : coupleAction === "wave"
              ? "wave"
              : coupleAction === "kiss"
                ? "kiss"
                : isHugging
                  ? "hug"
                  : "idle";

  const shouldHug = mode === "hug";

  const actionIsTemporary = mode === "wave" || mode === "kiss";

  // Mỗi lần bấm nút, kể cả bấm lặp,
  // khởi động lại animation và hiệu ứng.
  useEffect(() => {
    setActionExpired(false);

    if (!actionIsTemporary || cinematicActive) return;

    const timer = setTimeout(
      () => setActionExpired(true),
      mode === "kiss" ? 2900 : 2400,
    );

    return () => clearTimeout(timer);
  }, [mode, coupleActionVersion, cinematicActive, actionIsTemporary]);

  // Khi bắt đầu ôm phải chờ cả hai tới vị trí.
  useEffect(() => {
    arrivedRef.current = { boy: false, girl: false };
    setHugReady(false);
  }, [shouldHug, cinematicResetKey]);

  // Khi thổi nến, cả hai vui mừng.
  useEffect(() => {
    if (!celebrate || cinematicActive || shouldHug) return;

    setCelebratePlaying(true);

    const timer = setTimeout(() => setCelebratePlaying(false), 2500);

    return () => clearTimeout(timer);
  }, [celebrate, cinematicActive, shouldHug]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current !== null) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handleArrived = (side) => {
    if (!shouldHug) return;

    arrivedRef.current[side] = true;

    if (arrivedRef.current.boy && arrivedRef.current.girl) {
      setHugReady(true);
    }
  };

  const handleClickCharacter = (person) => {
    if (cinematicActive || shouldHug) return;

    if (clickTimerRef.current !== null) {
      clearTimeout(clickTimerRef.current);
    }

    setClickedWave(person);

    clickTimerRef.current = setTimeout(() => {
      setClickedWave(null);
      clickTimerRef.current = null;
    }, 2000);

    onInteract?.("couple");
  };

  // Trong chế độ kiss:
  // Bạn nữ vẫy tay làm cử chỉ hôn gió,
  // bạn nam phản ứng Happy.
  const getAnimation = (person) => {
    if (cinematicActive && !shouldHug) {
      return "Idle";
    }

    if (shouldHug) {
      return hugReady ? "Hug" : "Idle";
    }

    if (mode === "hold") {
      return "HoldHands";
    }

    if (mode === "dance") {
      return "Dance";
    }

    if (mode === "kiss" && !actionExpired) {
      return person === "girl" ? "Wave" : "Happy";
    }

    if (mode === "wave" && !actionExpired) {
      return "Wave";
    }

    if (clickedWave === person) {
      return "Wave";
    }

    if (celebratePlaying) {
      return "Happy";
    }

    return "Idle";
  };

  const showKissHearts = !cinematicActive && mode === "kiss" && !actionExpired;

  return (
    <group position={[0.2, 0, 1.65]}>
      <MovingChibi
        key={`boy-${cinematicResetKey}`}
        url={BOY_URL}
        side="boy"
        mode={mode}
        animation={getAnimation("boy")}
        replayKey={coupleActionVersion}
        onClick={() => handleClickCharacter("boy")}
        onArrived={handleArrived}
      />

      <MovingChibi
        key={`girl-${cinematicResetKey}`}
        url={GIRL_URL}
        side="girl"
        mode={mode}
        animation={getAnimation("girl")}
        replayKey={coupleActionVersion}
        onClick={() => handleClickCharacter("girl")}
        onArrived={handleArrived}
      />

      {showKissHearts && (
        <KissHeartEffect key={`kiss-${coupleActionVersion}`} />
      )}
    </group>
  );
}
