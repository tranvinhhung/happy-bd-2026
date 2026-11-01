
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";

const CAKE_POSITION = [-2.15, 0, 0.35];

function CakePart({
  position,
  args,
  color,
  emissive,
  ...props
}) {
  return (
    <mesh position={position} castShadow receiveShadow {...props}>
      <cylinderGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={emissive || "#000000"}
        roughness={0.72}
      />
    </mesh>
  );
}

function Candle({ x, z, blownOut, index }) {
  const flameRef = useRef();

  useFrame(({ clock }) => {
    if (!flameRef.current || blownOut) return;

    const t = clock.elapsedTime;

    flameRef.current.scale.y =
      1 + Math.sin(t * 12 + index) * 0.15;

    flameRef.current.position.x =
      x + Math.sin(t * 8 + index) * 0.012;
  });

  return (
    <group>
      <mesh position={[x, 1.78, z]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.26, 12]} />
        <meshStandardMaterial color="#fff2d7" />
      </mesh>

      {!blownOut && (
        <mesh
          ref={flameRef}
          position={[x, 1.97, z]}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#ffcf70" />
        </mesh>
      )}
    </group>
  );
}

function Confetti({ active }) {
  const refs = useRef([]);

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        x: Math.sin(i * 12.7) * 0.9,
        z: Math.cos(i * 8.3) * 0.7,
        speed: 0.35 + (i % 5) * 0.12,
        color: [
          "#ff92b9",
          "#ffe17d",
          "#b6a0ff",
          "#ffffff",
        ][i % 4],
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!active) return;

    const t = clock.elapsedTime;

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;

      const p = particles[i];
      const progress = (t * p.speed + i * 0.11) % 1;

      mesh.position.set(
        p.x + Math.sin(t + i) * 0.12,
        0.7 + progress * 2.5,
        p.z
      );

      mesh.rotation.set(
        t * 0.5 + i,
        t * 0.7,
        t + i
      );
    });
  });

  if (!active) return null;

  return (
    <group>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(element) => {
            refs.current[i] = element;
          }}
        >
          <boxGeometry args={[0.045, 0.09, 0.018]} />
          <meshBasicMaterial color={p.color} />
        </mesh>
      ))}
    </group>
  );
}

export default function BirthdayCake({
  blownOut = false,
  onBlow,
}) {
  return (
    <group position={CAKE_POSITION}>
      {/* Bàn bánh */}
      <CakePart
        position={[0, 0.55, 0]}
        args={[0.8, 0.75, 0.13, 32]}
        color="#a97d75"
      />

      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.5, 16]} />
        <meshStandardMaterial color="#916c6b" />
      </mesh>

      {/* Đĩa */}
      <CakePart
        position={[0, 0.66, 0]}
        args={[0.59, 0.59, 0.06, 32]}
        color="#fff1f7"
      />

      {/* Tầng dưới */}
      <CakePart
        position={[0, 0.91, 0]}
        args={[0.52, 0.52, 0.42, 32]}
        color="#f6a9c9"
      />

      {/* Kem tầng dưới */}
      <CakePart
        position={[0, 1.13, 0]}
        args={[0.54, 0.54, 0.1, 32]}
        color="#fff0f7"
      />

      {/* Tầng trên */}
      <CakePart
        position={[0, 1.37, 0]}
        args={[0.36, 0.36, 0.36, 32]}
        color="#ffbfd8"
      />

      {/* Kem tầng trên */}
      <CakePart
        position={[0, 1.57, 0]}
        args={[0.38, 0.38, 0.1, 32]}
        color="#fff5fa"
      />

      {/* Dâu tây trang trí */}
      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.3,
              1.64,
              Math.sin(angle) * 0.3,
            ]}
            castShadow
          >
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color="#ed557b" />
          </mesh>
        );
      })}

      {/* Nến */}
      {[
        [-0.14, 0],
        [0.14, 0],
        [0, 0.14],
      ].map(([x, z], i) => (
        <Candle
          key={i}
          x={x}
          z={z}
          index={i}
          blownOut={blownOut}
        />
      ))}

      {/* Ánh sáng nến */}
      {!blownOut && (
        <pointLight
          position={[0, 2, 0]}
          color="#ffd08c"
          intensity={1.7}
          distance={3}
        />
      )}

      {/* Lời chúc */}
      {blownOut && (
        <Float speed={1.5} floatIntensity={0.12}>
          <Text
            position={[0, 2.55, 0]}
            fontSize={0.18}
            color="#ffe0ee"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#9c527e"
            maxWidth={2.5}
          >
            Happy Birthday, Bé Tờ Hiên ♡
          </Text>
        </Float>
      )}

      <Confetti active={blownOut} />

      {/* Vùng bấm tương tác */}
      <mesh
        position={[0, 1.15, 0]}
        onClick={(event) => {
          event.stopPropagation();

          if (!blownOut) {
            onBlow?.();
          }
        }}
      >
        <cylinderGeometry args={[0.68, 0.68, 1.2, 32]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
