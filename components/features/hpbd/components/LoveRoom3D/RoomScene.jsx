"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Stars } from "@react-three/drei";
import { Suspense } from "react";

import RoomCamera from "./RoomCamera";
import CinematicCamera from "./CinematicCamera";
import FairyLights from "./FairyLights";
import QuestGlow from "./QuestGlow";
import CoupleCharacters from "./CoupleCharacters";
import RoomFurniture from "./RoomFurniture";
import HugEffects from "./HugEffects";
import BirthdayCake from "./BirthdayCake";
import BirthdayBalloons from "./BirthdayBalloons";
import LoveCorner from "./LoveCorner";

function RoomWalls() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[7, 0.16, 7]} />
        <meshStandardMaterial color="#e7b8b5" />
      </mesh>

      <mesh position={[0, 1.8, -3.45]} receiveShadow>
        <boxGeometry args={[7, 3.7, 0.16]} />
        <meshStandardMaterial color="#f7dce5" />
      </mesh>

      <mesh position={[-3.45, 1.8, 0]} receiveShadow>
        <boxGeometry args={[0.16, 3.7, 7]} />
        <meshStandardMaterial color="#eac9df" />
      </mesh>

      <mesh position={[0, 0.13, -3.32]}>
        <boxGeometry args={[6.8, 0.18, 0.08]} />
        <meshStandardMaterial color="#fff5f3" />
      </mesh>

      <mesh position={[-3.32, 0.13, 0]}>
        <boxGeometry args={[0.08, 0.18, 6.8]} />
        <meshStandardMaterial color="#fff5f3" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.45, 0.025, 1.1]}
        receiveShadow
      >
        <circleGeometry args={[1.75, 64]} />
        <meshStandardMaterial color="#fff0ef" />
      </mesh>
    </group>
  );
}

function RoomLighting({ isNight, cinematicActive }) {
  return (
    <>
      <ambientLight
        intensity={isNight ? 0.55 : 1.5}
        color={isNight ? "#a9b5ff" : "#ffffff"}
      />

      <directionalLight
        position={[4, 8, 5]}
        intensity={isNight ? 0.6 : 2.2}
        color={isNight ? "#a9b5ff" : "#fff3e9"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <pointLight
        position={[0, 3.5, 4]}
        intensity={isNight ? 9 : 4}
        distance={8}
        color={isNight ? "#ffd6e7" : "#ffffff"}
      />

      {cinematicActive && (
        <pointLight
          position={[0.2, 2.8, 3.3]}
          color="#ff9ac8"
          intensity={2.5}
          distance={6}
        />
      )}
    </>
  );
}

export default function RoomScene({
  isNight,
  isHugging,
  cameraTarget,
  resetVersion,
  onInteract,
  activeObject,
  celebrate,
  cakeBlownOut = false,
  onBlowCake,
  cinematicActive = false,
  cinematicProgress = 0,
  cinematicResetKey = 0,
  onCornerInteract,
}) {

  const showHearts = cinematicActive ? cinematicProgress >= 5 : isHugging;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        position: [9, 7, 10],
        fov: 38,
        near: 0.1,
        far: 100,
      }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={[isNight ? "#201b38" : "#f8eaf0"]} />

        <RoomLighting isNight={isNight} cinematicActive={cinematicActive} />

        {isNight && (
          <Stars
            radius={50}
            depth={30}
            count={300}
            factor={3}
            saturation={0}
            fade
          />
        )}

        <RoomWalls />
        <LoveCorner isNight={isNight} onInteract={onCornerInteract} />

        <BirthdayBalloons />

        <RoomFurniture isNight={isNight} onInteract={onInteract} />

        <CoupleCharacters
          isHugging={isHugging}
          onInteract={onInteract}
          celebrate={celebrate}
          cinematicActive={cinematicActive}
          cinematicProgress={cinematicProgress}
          cinematicResetKey={cinematicResetKey}
        />

        <HugEffects active={showHearts} />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.22}
          scale={10}
          blur={2.5}
          far={4}
          resolution={256}
          color="#75485f"
        />

        <RoomCamera
          cameraTarget={cameraTarget}
          resetVersion={resetVersion}
          cinematicActive={cinematicActive}
        />

        <CinematicCamera
          active={cinematicActive}
          progress={cinematicProgress}
        />

        <FairyLights isNight={isNight} />

        <QuestGlow
          active={activeObject === "photo"}
          position={[-3.05, 2.85, -0.85]}
        />

        <QuestGlow
          active={activeObject === "gift"}
          position={[2.25, 1.3, 2.25]}
        />

        <QuestGlow
          active={activeObject === "bed"}
          position={[1.25, 1.55, -1.45]}
        />

        <QuestGlow
          active={activeObject === "couple"}
          position={[0.2, 2.7, 1.15]}
        />

        <BirthdayCake blownOut={cakeBlownOut} onBlow={onBlowCake} />
      </Suspense>
    </Canvas>
  );
}
