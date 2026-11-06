
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function QuestGlow({
  position = [0, 0, 0],
  active = false,
  emphasized = false,
}) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;

    const time = clock.elapsedTime;

    meshRef.current.position.y =
      position[1] + Math.sin(time * 2) * 0.1;

    meshRef.current.scale.setScalar(
      (emphasized ? 1.7 : 1) + Math.sin(time * 3) * (emphasized ? 0.25 : 0.12)
    );
  });

  if (!active) return null;

  return (
    <group>
      <pointLight
        position={position}
        color={emphasized ? "#ffe9a8" : "#ffb9d8"}
        intensity={emphasized ? 4.5 : 2.5}
        distance={2}
      />

      <mesh
        ref={meshRef}
        position={position}
      >
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial
          color={emphasized ? "#fff0b5" : "#ffd8e8"}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}
