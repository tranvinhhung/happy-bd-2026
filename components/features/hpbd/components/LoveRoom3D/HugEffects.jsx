
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";

function HeartShape() {
  return useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(0, 0.22);
    shape.bezierCurveTo(-0.12, 0.36, -0.36, 0.2, -0.28, 0.02);
    shape.bezierCurveTo(-0.23, -0.12, -0.06, -0.25, 0, -0.3);
    shape.bezierCurveTo(0.06, -0.25, 0.23, -0.12, 0.28, 0.02);
    shape.bezierCurveTo(0.36, 0.2, 0.12, 0.36, 0, 0.22);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 12,
    });
  }, []);
}

function FlyingHeart({ index, geometry }) {
  const ref = useRef();

  const config = useMemo(() => {
    return {
      angle: (index / 15) * Math.PI * 2,
      speed: 0.3 + (index % 4) * 0.09,
      offset: (index * 0.37) % 1,
      size: 0.17 + (index % 3) * 0.055,
    };
  }, [index]);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const time = clock.elapsedTime;

    const progress =
      (time * config.speed + config.offset) % 1;

    const radius = 0.55 + progress * 0.55;

    ref.current.position.set(
      Math.cos(config.angle + time * 0.3) * radius,
      0.8 + progress * 2.5,
      Math.sin(config.angle + time * 0.3) * 0.35 + 0.35
    );

    ref.current.rotation.y = Math.sin(time + index) * 0.35;
    ref.current.rotation.z = Math.sin(time * 1.5 + index) * 0.2;

    const fade =
      Math.sin(progress * Math.PI);

    ref.current.scale.setScalar(
      config.size * Math.max(0.01, fade)
    );
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial
        color={index % 2 === 0 ? "#ff8fba" : "#ffd1e2"}
        emissive="#ff6fa8"
        emissiveIntensity={0.65}
        transparent
        opacity={0.85}
        roughness={0.35}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function HugEffects({ active = false }) {
  const geometry = HeartShape();

  if (!active) return null;

  return (
    <group position={[0.2, 0, 1.65]}>
      {/* Ánh sáng hồng dịu */}
      <pointLight
        position={[0, 2.4, 1.5]}
        color="#ff9ac7"
        intensity={2.5}
        distance={5}
      />

      {/* Trái tim bay */}
      {Array.from({ length: 15 }, (_, index) => (
        <FlyingHeart
          key={index}
          index={index}
          geometry={geometry}
        />
      ))}

      {/* Chữ lơ lửng phía trên hai nhân vật */}
      <Float
        speed={1.2}
        rotationIntensity={0.04}
        floatIntensity={0.12}
      >
        <Text
          position={[0, 3.25, 0.5]}
          fontSize={0.29}
          color="#ffe1ef"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#9d4b82"
          maxWidth={3.8}
        >
          Forever with you ♡
          <meshBasicMaterial
            color="#ffe1ef"
            toneMapped={false}
          />
        </Text>
      </Float>
    </group>
  );
}
