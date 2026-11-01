"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import AnimatedCharacter from "./AnimatedCharacter";

const BOY_URL = "/images/love-room/boyfriend.glb";
const GIRL_URL = "/images/love-room/girlfriend.glb";

const START_DISTANCE = 0.95;
const HUG_DISTANCE = 0.45;
const FACING_DIRECTION = 1;

const CINEMATIC_HUG_START = 2.5;

function MovingChibi({ url, side, isHugging, animation, onClick, onArrived }) {
  const groupRef = useRef(null);
  const arrivedRef = useRef(false);

  const isBoy = side === "boy";
  const direction = isBoy ? -1 : 1;

  const startX = direction * START_DISTANCE;
  const hugX = direction * HUG_DISTANCE;

  useEffect(() => {
    arrivedRef.current = false;
  }, [isHugging]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const targetX = isHugging ? hugX : startX;

    const targetRotation = isHugging
      ? ((isBoy ? 1 : -1) * FACING_DIRECTION * Math.PI) / 2
      : 0;

    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      targetRotation,
      3.5,
      delta,
    );

    const rotationReady = Math.abs(group.rotation.y - targetRotation) < 0.12;

    if (!isHugging || rotationReady) {
      group.position.x = MathUtils.damp(group.position.x, targetX, 3, delta);
    }

    const positionReady = Math.abs(group.position.x - hugX) < 0.025;

    const facingReady = Math.abs(group.rotation.y - targetRotation) < 0.08;

    if (isHugging && positionReady && facingReady && !arrivedRef.current) {
      arrivedRef.current = true;
      onArrived?.(side);
    }
  });

  return (
    <group ref={groupRef} position={[startX, 0, 0]}>
      <AnimatedCharacter url={url} animation={animation} onClick={onClick} />
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
}) {
  // Cinematic luôn ưu tiên trạng thái riêng.
  // Không bị ảnh hưởng bởi isHugging của Story Mode.
  const shouldHug = cinematicActive
    ? cinematicProgress >= CINEMATIC_HUG_START
    : isHugging;

  const [activeAnimation, setActiveAnimation] = useState(null);

  const [hugReady, setHugReady] = useState(false);

  const arrivedRef = useRef({
    boy: false,
    girl: false,
  });

  const animationTimerRef = useRef(null);

  useEffect(() => {
    arrivedRef.current = {
      boy: false,
      girl: false,
    };

    if (animationTimerRef.current !== null) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHugReady(false);
    setActiveAnimation(null);
  }, [shouldHug, cinematicResetKey]);

  const handleArrived = (side) => {
    if (!shouldHug) return;

    arrivedRef.current[side] = true;

    if (arrivedRef.current.boy && arrivedRef.current.girl) {
      setHugReady(true);
    }
  };

  const playTemporaryAnimation = (name, person) => {
    if (shouldHug || cinematicActive) return;

    if (animationTimerRef.current !== null) {
      clearTimeout(animationTimerRef.current);
    }

    setActiveAnimation({ name, person });

    animationTimerRef.current = setTimeout(
      () => {
        setActiveAnimation(null);
        animationTimerRef.current = null;
      },
      name === "Happy" ? 2500 : 2000,
    );
  };

  useEffect(() => {
    if (!celebrate || shouldHug || cinematicActive) {
      return;
    }

    const timer = setTimeout(() => {
      playTemporaryAnimation("Happy", "both");
    }, 0);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate, shouldHug, cinematicActive]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current !== null) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const getAnimation = (person) => {
    if (shouldHug) {
      return hugReady ? "Hug" : "Idle";
    }

    // Khi cinematic chưa đến đoạn ôm,
    // luôn đứng Idle, không chạy Happy/Wave cũ.
    if (cinematicActive) {
      return "Idle";
    }

    if (
      activeAnimation &&
      (activeAnimation.person === person || activeAnimation.person === "both")
    ) {
      return activeAnimation.name;
    }

    return "Idle";
  };

  const handleWave = (person) => {
    if (shouldHug || cinematicActive) return;

    playTemporaryAnimation("Wave", person);
    onInteract?.("couple");
  };

  return (
    <group position={[0.2, 0, 1.65]}>
      <MovingChibi
        key={`boy-${cinematicResetKey}`}
        url={BOY_URL}
        side="boy"
        isHugging={shouldHug}
        animation={getAnimation("boy")}
        onClick={() => handleWave("boy")}
        onArrived={handleArrived}
      />

      <MovingChibi
        key={`girl-${cinematicResetKey}`}
        url={GIRL_URL}
        side="girl"
        isHugging={shouldHug}
        animation={getAnimation("girl")}
        onClick={() => handleWave("girl")}
        onArrived={handleArrived}
      />
    </group>
  );
}
