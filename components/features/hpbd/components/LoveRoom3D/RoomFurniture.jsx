"use client";

import { Float, Text, useTexture } from "@react-three/drei";

function Bed({ onClick }) {
  return (
    <group
      position={[1.25, 0, -1.45]}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {/* Chân giường */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[2.55, 0.45, 1.8]} />
        <meshStandardMaterial color="#c98da7" />
      </mesh>

      {/* Nệm */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[2.4, 0.26, 1.72]} />
        <meshStandardMaterial color="#fff1f2" />
      </mesh>

      {/* Chăn */}
      <mesh position={[0, 0.79, 0.28]} castShadow>
        <boxGeometry args={[2.3, 0.12, 1.05]} />
        <meshStandardMaterial color="#f4b7cb" />
      </mesh>

      {/* Gối */}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.83, -0.55]}>
          <boxGeometry args={[0.85, 0.16, 0.45]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Đầu giường */}
      <mesh position={[0, 1.0, -0.9]} castShadow>
        <boxGeometry args={[2.6, 1.1, 0.18]} />
        <meshStandardMaterial color="#e8a9c0" />
      </mesh>
    </group>
  );
}

function Window({ isNight }) {
  return (
    <group position={[0.3, 2.2, -3.28]}>
      <mesh>
        <boxGeometry args={[2.15, 1.5, 0.12]} />
        <meshStandardMaterial color="#fff9f5" />
      </mesh>

      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.88, 1.25]} />
        <meshBasicMaterial color={isNight ? "#303b78" : "#a9d5ec"} />
      </mesh>

      {/* Khung cửa */}
      <mesh position={[0, 0, 0.17]}>
        <boxGeometry args={[0.08, 1.3, 0.07]} />
        <meshStandardMaterial color="#fffaf5" />
      </mesh>

      <mesh position={[0, 0, 0.17]}>
        <boxGeometry args={[1.95, 0.08, 0.07]} />
        <meshStandardMaterial color="#fffaf5" />
      </mesh>

      {isNight && (
        <>
          {[
            [-0.6, 0.35],
            [0.5, 0.25],
            [-0.15, -0.25],
            [0.7, -0.4],
          ].map(([x, y], index) => (
            <mesh key={index} position={[x, y, 0.2]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#fff5c7" />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function PhotoFrame({ onClick }) {
  const texture = useTexture("/images/love-room/our-photo.jpg");

  return (
    <group
      position={[-3.28, 2.25, -0.85]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[1.5, 1.3, 0.12]} />
        <meshStandardMaterial color="#b9819e" />
      </mesh>

      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[1.28, 1.08]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

function GiftBox({ onClick }) {
  return (
    <Float speed={2} floatIntensity={0.15}>
      <group
        position={[2.25, 0.55, 2.0]}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.65, 0.75]} />
          <meshStandardMaterial color="#f4a4bf" />
        </mesh>

        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.83, 0.14, 0.83]} />
          <meshStandardMaterial color="#ffdee9" />
        </mesh>

        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.14, 0.7, 0.8]} />
          <meshStandardMaterial color="#fff2bf" />
        </mesh>

        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.8, 0.7, 0.14]} />
          <meshStandardMaterial color="#fff2bf" />
        </mesh>
      </group>
    </Float>
  );
}

function SideTable({ isNight }) {
  return (
    <group position={[-2.35, 0, -1.75]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.95, 0.16, 0.85]} />
        <meshStandardMaterial color="#c88ca8" />
      </mesh>

      {[-0.32, 0.32].map((x) =>
        [-0.27, 0.27].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.26, z]}>
            <boxGeometry args={[0.09, 0.5, 0.09]} />
            <meshStandardMaterial color="#b9809e" />
          </mesh>
        )),
      )}

      <mesh position={[0, 0.89, 0]}>
        <cylinderGeometry args={[0.17, 0.25, 0.35, 16]} />
        <meshStandardMaterial
          color="#fff0c8"
          emissive="#ffd58d"
          emissiveIntensity={isNight ? 1.8 : 0.25}
        />
      </mesh>
    </group>
  );
}

export default function RoomFurniture({ isNight, onInteract }) {
  return (
    <group>
      <Bed onClick={() => onInteract("bed")} />

      <Window isNight={isNight} />

      <PhotoFrame onClick={() => onInteract("photo")} />

      <GiftBox onClick={() => onInteract("gift")} />

      <SideTable isNight={isNight} />
    </group>
  );
}
