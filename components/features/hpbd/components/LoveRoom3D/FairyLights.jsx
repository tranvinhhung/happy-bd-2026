"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";

const LIGHT_POINTS = Array.from({ length: 15 }, (_, i) => {
  const x = -2.9 + (i / 14) * 5.8;
  const y = 3.2 - Math.sin((i / 14) * Math.PI * 3) * 0.2;

  return [x, y, -3.28];
});

function LightBulb({ position, index, isNight }) {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.emissiveIntensity = isNight
      ? 1.6 + Math.sin(clock.elapsedTime * 2 + index) * 0.35
      : 0.25;
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.07, 10, 10]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#fff2c9"
        emissive="#ffcf83"
        emissiveIntensity={isNight ? 1.6 : 0.25}
      />
    </mesh>
  );
}

export default function FairyLights({ isNight }) {
  const quaternion = new Quaternion();
  return (
    <group>
      {LIGHT_POINTS.slice(0, -1).map((point, i) => {
        const next = LIGHT_POINTS[i + 1];

        const start = new Vector3(...point);
        const end = new Vector3(...next);
        const middle = start.clone().add(end).multiplyScalar(0.5);

        return (
          <mesh
            key={`wire-${i}`}
            position={middle}
            quaternion={(() => {
              const direction = end.clone().sub(start).normalize();
              quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);
              return quaternion;
            })()}
          >
            <cylinderGeometry args={[0.012, 0.012, start.distanceTo(end), 6]} />
            <meshStandardMaterial color="#9c7286" />
          </mesh>
        );
      })}

      {LIGHT_POINTS.map((point, index) => (
        <LightBulb
          key={index}
          position={point}
          index={index}
          isNight={isNight}
        />
      ))}
    </group>
  );
}
