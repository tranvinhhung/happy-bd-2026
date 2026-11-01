"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";

function Clickable({ children, onClick, ...props }) {
  return (
    <group
      {...props}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
    </group>
  );
}

function HeartMesh({
  position = [0, 0, 0],
  scale = 1,
  color = "#ff91bd",
  emissive = false,
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(0, 0.15);
    shape.bezierCurveTo(-0.3, 0.5, -0.8, 0.2, 0, -0.45);
    shape.bezierCurveTo(0.8, 0.2, 0.3, 0.5, 0, 0.15);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
  }, []);

  return (
    <mesh geometry={geometry} position={position} scale={scale} castShadow>
      <meshStandardMaterial
        color={color}
        emissive={emissive ? color : "#000000"}
        emissiveIntensity={emissive ? 1.5 : 0}
        roughness={0.35}
      />
    </mesh>
  );
}

function Polaroid({ position, rotation = 0, color, index, onClick }) {
  return (
    <Clickable
      position={position}
      rotation={[0, 0, rotation]}
      onClick={onClick}
    >
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.52, 0.025]} />
        <meshStandardMaterial color="#fff9f5" />
      </mesh>

      <mesh position={[0, 0.045, 0.018]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <HeartMesh position={[0, 0.045, 0.035]} scale={0.19} color="#fff2f8" />

      <mesh position={[0, 0.28, 0.03]}>
        <boxGeometry args={[0.075, 0.085, 0.035]} />
        <meshStandardMaterial color="#e8bd8f" />
      </mesh>

      <Text
        position={[0, -0.2, 0.03]}
        fontSize={0.065}
        color="#a66b87"
        anchorX="center"
      >
        {`LOVE ${index + 1}`}
      </Text>
    </Clickable>
  );
}

function PolaroidWall({ onInteract }) {
  const photos = [
    { x: -0.65, y: 0.05, rotation: -0.1, color: "#f3a5c5" },
    { x: 0, y: -0.03, rotation: 0.06, color: "#bba9ed" },
    { x: 0.65, y: 0.05, rotation: -0.07, color: "#9dcfc7" },
  ];

  return (
    <group>
      <mesh position={[0, 0.34, -0.03]}>
        <boxGeometry args={[1.75, 0.025, 0.025]} />
        <meshStandardMaterial color="#e8c1c7" />
      </mesh>

      {photos.map((photo, index) => (
        <Polaroid
          key={index}
          position={[photo.x, photo.y, 0]}
          rotation={photo.rotation}
          color={photo.color}
          index={index}
          onClick={() => onInteract?.("photo", index)}
        />
      ))}
    </group>
  );
}

function TinyTeddy({ onClick }) {
  const teddyRef = useRef(null);

  useFrame(({ clock }) => {
    if (!teddyRef.current) return;

    teddyRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.5) * 0.035;
  });

  return (
    <Clickable onClick={onClick}>
      <group ref={teddyRef}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial color="#f2d3b5" />
        </mesh>

        <mesh position={[0, 0.38, 0]} castShadow>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color="#f2d3b5" />
        </mesh>

        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.53, 0]}>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#f2d3b5" />
          </mesh>
        ))}

        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.41, 0.17]}>
            <sphereGeometry args={[0.022, 12, 12]} />
            <meshStandardMaterial color="#443043" />
          </mesh>
        ))}

        <mesh position={[0, 0.32, 0.19]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#fff2e6" />
        </mesh>

        <mesh position={[0, 0.33, 0.24]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#7e5260" />
        </mesh>
      </group>
    </Clickable>
  );
}

function WallShelf({ onInteract }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.38]} />
        <meshStandardMaterial color="#fff3e9" />
      </mesh>

      <mesh position={[-0.45, 0.3, 0.03]}>
        <boxGeometry args={[0.18, 0.5, 0.2]} />
        <meshStandardMaterial color="#d9a1c8" />
      </mesh>

      <mesh position={[-0.24, 0.27, 0.03]}>
        <boxGeometry args={[0.16, 0.44, 0.2]} />
        <meshStandardMaterial color="#a8b8e7" />
      </mesh>

      <mesh position={[-0.05, 0.32, 0.03]}>
        <boxGeometry args={[0.16, 0.54, 0.2]} />
        <meshStandardMaterial color="#f3d69e" />
      </mesh>

      <group position={[0.42, 0.07, 0.03]} scale={0.75}>
        <TinyTeddy onClick={() => onInteract?.("shelf")} />
      </group>
    </group>
  );
}

function FloorTeddy({ onInteract }) {
  const teddyRef = useRef(null);

  useFrame(({ clock }) => {
    if (!teddyRef.current) return;

    teddyRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.045;
  });

  return (
    <Clickable onClick={() => onInteract?.("teddy")}>
      <group ref={teddyRef}>
        <mesh position={[0, 0.33, 0]} castShadow>
          <sphereGeometry args={[0.33, 24, 24]} />
          <meshStandardMaterial color="#f4d8bf" />
        </mesh>

        <mesh position={[0, 0.78, 0]} castShadow>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color="#f4d8bf" />
        </mesh>

        {[-0.26, 0.26].map((x) => (
          <mesh key={x} position={[x, 1.04, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#f4d8bf" />
          </mesh>
        ))}

        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 0.82, 0.31]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#443343" />
          </mesh>
        ))}

        <mesh position={[0, 0.67, 0.31]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#fff1e6" />
        </mesh>

        <mesh position={[0, 0.69, 0.43]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#7a5260" />
        </mesh>

        <HeartMesh position={[0, 0.35, 0.33]} scale={0.45} color="#ff8fb9" />

        {[-0.32, 0.32].map((x) => (
          <mesh key={x} position={[x, 0.37, 0.16]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#f4d8bf" />
          </mesh>
        ))}
      </group>
    </Clickable>
  );
}

function FlowerPot({ onInteract, isNight }) {
  const flowerRef = useRef(null);

  useFrame(({ clock }) => {
    if (!flowerRef.current) return;

    flowerRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * 0.05;
  });

  return (
    <Clickable onClick={() => onInteract?.("flower")}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.17, 0.4, 20]} />
        <meshStandardMaterial color="#fff0e6" />
      </mesh>

      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.07, 20]} />
        <meshStandardMaterial color="#e8bfd4" />
      </mesh>

      <group ref={flowerRef}>
        {[-0.16, 0, 0.16].map((x, index) => (
          <group key={index} position={[x, 0, 0]}>
            <mesh position={[0, 0.72 + index * 0.12, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.55, 8]} />
              <meshStandardMaterial color="#6aaf83" />
            </mesh>

            <mesh position={[0, 1 + index * 0.12, 0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={index === 1 ? "#ff9ec7" : "#ffc3d9"}
                emissive={isNight ? "#ff80b8" : "#000000"}
                emissiveIntensity={isNight ? 0.5 : 0}
              />
            </mesh>
          </group>
        ))}
      </group>
    </Clickable>
  );
}

function NeonHeart({ isNight, onInteract }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <Clickable
      onClick={() => {
        setEnabled((value) => !value);
        onInteract?.("neon");
      }}
    >
      <HeartMesh
        position={[0, 0, 0]}
        scale={0.85}
        color="#ff80b8"
        emissive={enabled && isNight}
      />

      {enabled && isNight && (
        <pointLight
          position={[0, 0, 0.45]}
          color="#ff78b6"
          intensity={1.3}
          distance={2.2}
        />
      )}

      <Text
        position={[0, -0.65, 0.15]}
        fontSize={0.16}
        color={enabled ? "#ffd2e7" : "#a68ca6"}
        anchorX="center"
      >
        LOVE YOU
      </Text>
    </Clickable>
  );
}

export default function LoveCorner({ isNight = true, onInteract }) {
  return (
    <group>
      {/* 1. Dây ảnh: đưa về phần tường trái phía trước,
          tránh khung ảnh thật ở góc sau */}
      <group
        position={[-3.22, 2.65, 1.5]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.65}
      >
        <PolaroidWall  />
      </group>

      {/* 2. Kệ sách: chuyển xuống thấp và gần phía trước */}
      <group
        position={[-3.12, 1.25, 1.45]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.65}
      >
        <WallShelf onInteract={onInteract} />
      </group>

      {/* 3. Neon: đưa về phần tường trái phía sau */}
      <group
        position={[-3.2, 2.95, 2.45]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.65}
      >
        <NeonHeart isNight={isNight} onInteract={onInteract} />
      </group>

      {/* 4. Gấu bông: giữ ở góc trước bên trái */}
      <group position={[-2.85, 0, 2.65]} scale={0.7}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <circleGeometry args={[0.72, 32]} />
          <meshStandardMaterial color="#f8d8e7" />
        </mesh>

        <FloorTeddy onInteract={onInteract} />
      </group>

      {/* 5. Chậu hoa: sát tường, giữa gấu và bàn bánh */}
      <group position={[-3.05, 0, 0.6]} scale={0.72}>
        <FlowerPot isNight={isNight} onInteract={onInteract} />
      </group>
    </group>
  );
}
