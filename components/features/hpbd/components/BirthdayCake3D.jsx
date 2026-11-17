"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CanvasTexture, CatmullRomCurve3, MathUtils, SRGBColorSpace, Vector3 } from "three";

function CreamRing({ radius, y, count }) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index / count * Math.PI * 2;
    return <mesh key={index} position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]} scale={[1, 1.15, 1]} castShadow receiveShadow>
      <sphereGeometry args={[0.073, 16, 12]} />
      <meshStandardMaterial color={index % 6 === 0 ? "#ed9dbb" : "#fff6e9"} roughness={0.65} />
    </mesh>;
  });
}

function CakeModel({ animate }) {
  const cakeRef = useRef(null);
  const flameRef = useRef(null);
  const label = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 88px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillStyle = "#9e4f74";
    ctx.shadowColor = "#fff6ee";
    ctx.shadowOffsetY = 3;
    ctx.fillText("Happy Birthday ♡", 512, 128);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => label.dispose(), [label]);

  const stripe = useMemo(() => new CatmullRomCurve3(Array.from({ length: 97 }, (_, index) => {
    const angle = index / 96 * Math.PI * 7;
    return new Vector3(Math.cos(angle) * 0.068, index / 96 * 0.54 - 0.27, Math.sin(angle) * 0.068);
  })), []);

  useFrame(({ pointer, clock }, delta) => {
    if (!animate) return;
    cakeRef.current.rotation.y = MathUtils.damp(cakeRef.current.rotation.y, -0.28 + pointer.x * 0.55, 4, delta);
    cakeRef.current.rotation.x = MathUtils.damp(cakeRef.current.rotation.x, pointer.y * 0.06, 4, delta);
    flameRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 7) * 0.07;
  });

  return <group ref={cakeRef} rotation={[0, -0.28, 0]}>
    {/* The tiers and platter are complete cylinders, including their rear faces. */}
    <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.69, 1.64, 0.13, 64]} />
      <meshStandardMaterial color="#d6b9cd" roughness={0.3} metalness={0.12} />
    </mesh>
    <mesh position={[0, 0.15, 0]} receiveShadow>
      <cylinderGeometry args={[1.61, 1.64, 0.045, 64]} />
      <meshStandardMaterial color="#fff9ef" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.175, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <torusGeometry args={[1.62, 0.027, 8, 64]} />
      <meshStandardMaterial color="#f9e8ee" roughness={0.27} metalness={0.15} />
    </mesh>
    <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <torusGeometry args={[1.65, 0.026, 8, 64]} />
      <meshStandardMaterial color="#b58ca8" roughness={0.38} metalness={0.1} />
    </mesh>
    <mesh position={[0, 0.59, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.43, 1.46, 0.84, 64]} />
      <meshStandardMaterial color="#eaa0bd" roughness={0.63} />
    </mesh>
    <mesh position={[0, 1.025, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.47, 1.44, 0.075, 64]} />
      <meshStandardMaterial color="#fff3e8" roughness={0.65} />
    </mesh>
    <CreamRing radius={1.37} y={1.07} count={32} />
    <mesh position={[0, 1.38, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.86, 0.9, 0.64, 64]} />
      <meshStandardMaterial color="#f2bfd4" roughness={0.63} />
    </mesh>
    <mesh position={[0, 1.72, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.91, 0.87, 0.075, 64]} />
      <meshStandardMaterial color="#fff6eb" roughness={0.6} />
    </mesh>
    <CreamRing radius={0.81} y={1.765} count={22} />
    <mesh position={[0, 0.61, 0]}>
      <cylinderGeometry args={[1.465, 1.465, 0.38, 48, 1, true, -0.9, 1.8]} />
      <meshStandardMaterial map={label} transparent roughness={0.7} depthWrite={false} />
    </mesh>
    <group position={[0, 2.02, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.54, 24]} />
        <meshStandardMaterial color="#fff3df" roughness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[stripe, 96, 0.013, 6, false]} />
        <meshStandardMaterial color="#d475a0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.295, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.065, 8]} />
        <meshStandardMaterial color="#5e3c43" />
      </mesh>
      <group ref={flameRef} position={[0, 0.43, 0]}>
        <mesh scale={[0.075, 0.17, 0.075]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ffc46f" emissive="#ff9e38" emissiveIntensity={1.3} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.055, 0.018]} scale={[0.04, 0.085, 0.04]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color="#fff3b4" />
        </mesh>
      </group>
    </group>
  </group>;
}

export default function BirthdayCake3D({ active, reducedMotion, fallback }) {
  return <Canvas
    shadows
    dpr={[1, 1.5]}
    frameloop={active && !reducedMotion ? "always" : "demand"}
    camera={{ position: [0, 3.3, 6.8], fov: 36, near: 0.1, far: 30 }}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    fallback={fallback}
    onCreated={({ camera }) => camera.lookAt(0, 1.22, 0)}
    role="img"
    data-scroll-through="true"
    aria-label="Bánh sinh nhật 3D hai tầng, kem hồng và nến đang cháy"
    style={{ width: "100%", height: "100%", touchAction: "pan-y" }}
  >
    <ambientLight intensity={0.25} />
    <hemisphereLight args={["#fff6ed", "#a36b8d", 0.55]} />
    <directionalLight
      position={[-3.5, 5, 3.5]}
      intensity={2.6}
      color="#fff2e4"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-3.5}
      shadow-camera-right={3.5}
      shadow-camera-top={3.5}
      shadow-camera-bottom={-3.5}
      shadow-camera-near={0.5}
      shadow-camera-far={15}
      shadow-bias={-0.0002}
      shadow-normalBias={0.012}
    />
    <directionalLight position={[3, 2, -3]} intensity={0.65} color="#edb5dc" />
    <CakeModel animate={active && !reducedMotion} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <shadowMaterial transparent opacity={0.27} />
    </mesh>
  </Canvas>;
}
