
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

export default function AnimatedCharacter({
  url,
  animation = "Idle",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
}) {
  const groupRef = useRef();

  const { scene, animations } = useGLTF(url);

  // Clone riêng model và skeleton
  const clonedScene = useMemo(
    () => SkeletonUtils.clone(scene),
    [scene]
  );

  const { actions, names } = useAnimations(
    animations,
    groupRef
  );

  useEffect(() => {
    clonedScene.traverse((object) => {
      if (object.isMesh || object.isSkinnedMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    const action = actions[animation];

    if (!action) {
      console.warn(
        `Không tìm thấy animation: ${animation}`,
        "Animations có sẵn:",
        names
      );
      return;
    }

    action.reset();
    // eslint-disable-next-line react-hooks/immutability
    action.enabled = true;

    if (animation === "Idle") {
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
    } else {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    }

    action.fadeIn(0.25).play();

    return () => {
      action.fadeOut(0.25);
    };
  }, [actions, animation, names]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
