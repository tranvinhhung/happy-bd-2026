
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BALLOON_COLORS = [
  "#ff8fbd",
  "#b5a0ff",
  "#ffe18a",
  "#8bded7",
  "#ffa98d",
  "#f6a8e4",
  "#a6c8ff",
];

function Balloon({
  position = [0, 0, 0],
  color = "#ff9fc7",
  scale = 1,
  phase = 0,
}) {
  const balloonRef = useRef(null);

  const stringPoints = useMemo(() => {
    return [
      new THREE.Vector3(0, -0.27, 0),
      new THREE.Vector3(0.025, -0.55, 0),
      new THREE.Vector3(-0.025, -0.9, 0),
      new THREE.Vector3(0.01, -1.2, 0),
    ];
  }, []);

  const stringCurve = useMemo(
    () => new THREE.CatmullRomCurve3(stringPoints),
    [stringPoints]
  );

  useFrame(({ clock }) => {
    if (!balloonRef.current) return;

    const time = clock.elapsedTime;

    balloonRef.current.rotation.z =
      Math.sin(time * 0.8 + phase) * 0.075;

    balloonRef.current.position.y =
      position[1] +
      Math.sin(time * 1.2 + phase) * 0.06;
  });

  return (
    <group
      ref={balloonRef}
      position={position}
      scale={scale}
    >
      {/* Thân bóng */}
      <mesh castShadow>
        <sphereGeometry args={[0.29, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.22}
          metalness={0.05}
          clearcoat={0.65}
          clearcoatRoughness={0.18}
        />
      </mesh>

      {/* Làm bóng hơi dài giống bóng bay */}
      <mesh scale={[0.88, 1.18, 0.88]}>
        <sphereGeometry args={[0.29, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.22}
          clearcoat={0.65}
        />
      </mesh>

      {/* Điểm sáng nhỏ */}
      <mesh position={[-0.1, 0.12, 0.255]}>
        <sphereGeometry args={[0.065, 12, 12]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Nút thắt bóng */}
      <mesh
        position={[0, -0.34, 0]}
        rotation={[0, 0, Math.PI]}
      >
        <coneGeometry args={[0.07, 0.12, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Dây bóng */}
      <mesh>
        <tubeGeometry
          args={[stringCurve, 20, 0.008, 5, false]}
        />
        <meshStandardMaterial color="#fce9f2" />
      </mesh>
    </group>
  );
}

export default function BirthdayBalloons() {
  const balloons = useMemo(
    () => [
      // Góc sau bên trái
      {
        position: [-2.8, 2.8, -2.65],
        color: BALLOON_COLORS[0],
        phase: 0,
        scale: 1,
      },
      {
        position: [-2.3, 3.15, -2.85],
        color: BALLOON_COLORS[1],
        phase: 1,
        scale: 0.9,
      },
      {
        position: [-3.05, 3.35, -2.9],
        color: BALLOON_COLORS[2],
        phase: 2,
        scale: 0.85,
      },
      {
        position: [-2.55, 2.35, -2.95],
        color: BALLOON_COLORS[3],
        phase: 3,
        scale: 0.85,
      },

      // Góc sau bên phải
      {
        position: [2.65, 2.85, -2.7],
        color: BALLOON_COLORS[4],
        phase: 1.4,
        scale: 1,
      },
      {
        position: [3.05, 3.25, -2.9],
        color: BALLOON_COLORS[5],
        phase: 2.6,
        scale: 0.88,
      },
      {
        position: [2.3, 3.4, -2.95],
        color: BALLOON_COLORS[6],
        phase: 3.8,
        scale: 0.9,
      },
      {
        position: [3.1, 2.4, -2.85],
        color: BALLOON_COLORS[2],
        phase: 4.5,
        scale: 0.8,
      },
    ],
    []
  );

  return (
    <group>
      {balloons.map((balloon, index) => (
        <Balloon
          key={index}
          {...balloon}
        />
      ))}
    </group>
  );
}
