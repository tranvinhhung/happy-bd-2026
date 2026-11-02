/* eslint-disable react-hooks/refs */

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createHeartGeometry() {
  const shape = new THREE.Shape();

  shape.moveTo(0, 0.15);
  shape.bezierCurveTo(-0.22, 0.42, -0.55, 0.1, 0, -0.35);
  shape.bezierCurveTo(0.55, 0.1, 0.22, 0.42, 0, 0.15);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 2,
    curveSegments: 16,
  });

  geometry.center();
  return geometry;
}

function FlyingHeart({ geometry, index, startRef }) {
  const meshRef = useRef(null);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = clock.elapsedTime - (startRef.current ?? clock.elapsedTime);
    const delay = index * 0.28;
    const duration = 1.25;
    const progress = (elapsed - delay) / duration;

    if (progress < 0 || progress > 1) {
      mesh.visible = false;
      return;
    }

    mesh.visible = true;

    const t = THREE.MathUtils.smoothstep(progress, 0, 1);

    // Trong CoupleCharacters:
    // bạn nữ ở X dương, bạn nam ở X âm.
    const startX = 0.82;
    const endX = -0.82;

    const x = THREE.MathUtils.lerp(startX, endX, t);
    const y = 1.65 + Math.sin(t * Math.PI) * 0.48 + index * 0.05;

    const z = 0.52 + Math.sin(t * Math.PI) * 0.12;

    mesh.position.set(x, y, z);

    mesh.rotation.y = Math.sin(elapsed * 5 + index) * 0.2;
    mesh.rotation.z = Math.sin(elapsed * 4 + index) * 0.2;

    const fade = Math.sin(progress * Math.PI);

    mesh.scale.setScalar((0.35 + index * 0.07) * Math.max(0.001, fade));
  });

  return (
    <mesh ref={meshRef} geometry={geometry} visible={false}>
      <meshStandardMaterial
        color={index === 1 ? "#ffd2e6" : "#ff7eaf"}
        emissive="#ff6fa9"
        emissiveIntensity={1.5}
        roughness={0.3}
        transparent
        opacity={0.95}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function KissHeartEffect() {
  const geometry = useMemo(() => createHeartGeometry(), []);
  const startRef = useRef(null);

  useFrame(({ clock }) => {
    if (startRef.current === null) {
      startRef.current = clock.elapsedTime;
    }
  });

  // Giải phóng geometry khi component không còn dùng
  // Geometry được quản lý bởi React Three Fiber.
  return (
    <group>
      <pointLight
        position={[0, 1.9, 0.7]}
        color="#ff88bb"
        intensity={1.2}
        distance={2.8}
      />

      {[0, 1, 2].map((index) => (
        <FlyingHeart
          key={index}
          index={index}
          geometry={geometry}
          startRef={startRef}
        />
      ))}
    </group>
  );
}
