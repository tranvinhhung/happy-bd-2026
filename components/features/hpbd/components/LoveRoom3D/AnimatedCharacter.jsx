
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

const LOOP_ANIMATIONS = ["Idle", "Wave", "Dance"];

export default function AnimatedCharacter({
  url,
  animation = "Idle",
  loop = false,
  replayKey = 0,
  onClick,
}) {
  const groupRef = useRef(null);

  const { scene, animations } = useGLTF(url);

  // Mỗi nhân vật sử dụng một skeleton riêng
  const model = useMemo(
    () => SkeletonUtils.clone(scene),
    [scene]
  );

  const { actions, names } = useAnimations(
    animations,
    groupRef
  );

  // Bật đổ bóng cho nhân vật
  useEffect(() => {
    model.traverse((object) => {
      if (object.isMesh || object.isSkinnedMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [model]);

  // Điều khiển animation
  useEffect(() => {
    const action = actions[animation];

    if (!action) {
      console.warn(
        `Không tìm thấy animation "${animation}" trong ${url}.`,
        "Animations có sẵn:",
        names
      );
      return;
    }

    // Tắt mượt những animation khác
    Object.entries(actions).forEach(([name, otherAction]) => {
      if (name !== animation && otherAction) {
        otherAction.fadeOut(0.2);
      }
    });

    const shouldLoop =
      loop || LOOP_ANIMATIONS.includes(animation);

    action.reset();
    // eslint-disable-next-line react-hooks/immutability
    action.enabled = true;
    action.paused = false;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(1);

    action.setLoop(
      shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce,
      shouldLoop ? Infinity : 1
    );

    // Giữ tư thế cuối khi ôm
    action.clampWhenFinished = !shouldLoop;

    action.fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, animation, loop, replayKey, names, url]);

  return (
    <group
      ref={groupRef}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <primitive object={model} />
    </group>
  );
}

// Tải trước hai model
useGLTF.preload("/images/love-room/boyfriend.glb");
useGLTF.preload("/images/love-room/girlfriend.glb");
