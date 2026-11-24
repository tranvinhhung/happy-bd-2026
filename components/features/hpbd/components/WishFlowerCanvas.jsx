"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const T_BOY_ARRIVE = 2.3;   // Cánh tay nam đưa hoa từ góc dưới trái lên trung tâm
const T_GIRL_GRASP = 4.2;   // Cánh tay nữ từ góc trên phải vươn xuống nắm lấy bông hoa
const T_BLOOM_END = 6.2;    // Bông hoa nở rộ & tỏa sáng kim tuyến

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function seeded(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.28, "rgba(255, 214, 236, 0.92)");
  grad.addColorStop(0.6, "rgba(255, 140, 196, 0.4)");
  grad.addColorStop(1, "rgba(255, 140, 196, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.24, 0.16, 0.34, 0.56, 0.18, 0.84);
  shape.bezierCurveTo(0.08, 0.98, -0.08, 0.98, -0.18, 0.84);
  shape.bezierCurveTo(-0.34, 0.56, -0.24, 0.16, 0, 0);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape, 24);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Khum cánh hoa cong tự nhiên
    const cupZ = Math.sin(Math.min(1, y) * Math.PI) * 0.08 - x * x * 0.45;
    pos.setZ(i, cupZ);
  }
  geo.computeVertexNormals();
  return geo;
}

function createLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.14, 0.12, 0.18, 0.38, 0, 0.56);
  shape.bezierCurveTo(-0.18, 0.38, -0.14, 0.12, 0, 0);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape, 16);
  geo.computeVertexNormals();
  return geo;
}

const POLLEN_COUNT = 120;
const FLOATING_PETAL_COUNT = 26;

function createPollenState() {
  const positions = new Float32Array(POLLEN_COUNT * 3);
  const colors = new Float32Array(POLLEN_COUNT * 3);
  const phases = new Float32Array(POLLEN_COUNT);
  const speeds = new Float32Array(POLLEN_COUNT);

  for (let i = 0; i < POLLEN_COUNT; i++) {
    positions[i * 3 + 2] = -999;
    phases[i] = seeded(i * 5 + 1) * Math.PI * 2;
    speeds[i] = 0.28 + seeded(i * 5 + 2) * 0.48;

    const palette = ["#ffe6b3", "#ffd1e6", "#fff6db", "#ff9ece"];
    const c = new THREE.Color(palette[i % palette.length]);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  return { positions, colors, phases, speeds, active: false, time: 0 };
}

const FLOATING_PETALS = Array.from({ length: FLOATING_PETAL_COUNT }, (_, i) => ({
  angle: (i / FLOATING_PETAL_COUNT) * Math.PI * 2 + seeded(i * 7 + 1) * 0.4,
  radius: 0.75 + seeded(i * 7 + 2) * 2.1,
  liftSpeed: 0.35 + seeded(i * 7 + 3) * 0.45,
  swayFreq: 1.2 + seeded(i * 7 + 4) * 1.4,
  delay: seeded(i * 7 + 5) * 1.1,
  scale: 0.22 + seeded(i * 7 + 6) * 0.2,
  color: ["#ff9ece", "#ffc6e2", "#ffe8f3", "#ffb0d6"][i % 4],
}));

const PETAL_LAYERS = [
  { count: 5, radius: 0.08, y: 0.06, scale: 0.52, baseTilt: 0.22, openTilt: 0.72, color: "#ff72b0" },
  { count: 7, radius: 0.12, y: 0.04, scale: 0.74, baseTilt: 0.34, openTilt: 1.05, color: "#ff94c4" },
  { count: 9, radius: 0.16, y: 0.02, scale: 0.94, baseTilt: 0.45, openTilt: 1.32, color: "#ffc2de" },
];

function FlowerScene({ onTextReveal }) {
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const isCompact = aspect < 0.85;
  const sceneScale = aspect < 0.68 ? 0.72 : aspect < 1.0 ? 0.86 : 1.04;

  const flowerGroupRef = useRef(null);
  const petalRefs = useRef([]);
  const coreGlowRef = useRef(null);
  const pollenPointsRef = useRef(null);
  const floatingPetalRefs = useRef([]);
  const auraRing1Ref = useRef(null);
  const auraRing2Ref = useRef(null);

  const elapsedRef = useRef(0);
  const textShownRef = useRef(false);
  const pollenRef = useRef(null);

  const glowTexture = useMemo(() => createGlowTexture(), []);
  const petalGeo = useMemo(() => createPetalGeometry(), []);
  const leafGeo = useMemo(() => createLeafGeometry(), []);
  const initialPollen = useMemo(() => createPollenState(), []);

  useEffect(() => {
    pollenRef.current = createPollenState();
    if (pollenPointsRef.current) {
      pollenRef.current.positions =
        pollenPointsRef.current.geometry.attributes.position.array;
    }
    return () => {
      glowTexture.dispose();
      petalGeo.dispose();
      leafGeo.dispose();
    };
  }, [glowTexture, petalGeo, leafGeo]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    const flower = flowerGroupRef.current;
    const pollen = pollenRef.current;
    if (!flower || !pollen) return;

    // 1. Bông hoa đi theo vòng cung tay nam từ mép dưới trái lên trung tâm
    const boyProgress = smoothstep(0, T_BOY_ARRIVE, t);
    const arcAngle = (1 - boyProgress) * 0.48;
    const radius = isCompact ? 1.85 : 2.35;
    const flowerX = -Math.sin(arcAngle) * radius * 0.75;
    const flowerY = -Math.sin(arcAngle) * radius * 0.95 - 0.04 * sceneScale;

    // 2. Nở rộ khi tay nữ chạm vào bông hoa ở trung tâm
    const bloomProgress = smoothstep(T_GIRL_GRASP - 0.2, T_BLOOM_END, t);

    const flowerZ =
      THREE.MathUtils.lerp(-0.15, 0.75, boyProgress) + bloomProgress * 0.45;

    flower.position.set(flowerX, flowerY + bloomProgress * 0.1, flowerZ);
    flower.rotation.set(
      0.42 - bloomProgress * 0.18,
      t * 0.35 * bloomProgress,
      -0.25 * (1 - bloomProgress * 0.65)
    );
    flower.scale.setScalar(sceneScale * (0.86 + bloomProgress * 0.42));

    // Mở từng lớp cánh hoa 3D theo độ trễ tự nhiên
    let petalIdx = 0;
    PETAL_LAYERS.forEach((layer, layerIdx) => {
      const layerBloom = smoothstep(
        layerIdx * 0.16,
        0.72 + layerIdx * 0.14,
        bloomProgress
      );
      for (let i = 0; i < layer.count; i++) {
        const mesh = petalRefs.current[petalIdx++];
        if (mesh) {
          mesh.rotation.x = THREE.MathUtils.lerp(
            layer.baseTilt,
            layer.openTilt,
            layerBloom
          );
        }
      }
    });

    // Ánh sáng nhụy hoa tỏa rạng khi nở
    if (coreGlowRef.current) {
      coreGlowRef.current.material.opacity = 0.28 + bloomProgress * 0.72;
      coreGlowRef.current.scale.setScalar(
        1.1 + bloomProgress * 1.45 + Math.sin(t * 3) * 0.08
      );
    }

    // 3. Hiệu ứng hương hoa: Vòng hào quang lan tỏa dịu + cánh hoa 3D bay lượn + phấn hoa ấm áp bay lên
    const auraTime = Math.max(0, t - T_GIRL_GRASP);
    [
      { ref: auraRing1Ref, delay: 0 },
      { ref: auraRing2Ref, delay: 0.65 },
    ].forEach(({ ref, delay }) => {
      const ring = ref.current;
      if (!ring) return;
      const rt = Math.max(0, auraTime - delay);
      if (rt <= 0 || rt > 2.6) {
        ring.visible = false;
        return;
      }
      ring.visible = true;
      const p = rt / 2.6;
      ring.position.set(flowerX, flowerY + 0.14, flowerZ);
      ring.scale.setScalar(sceneScale * (0.3 + p * 3.2));
      ring.material.opacity = Math.sin(p * Math.PI) * 0.45;
    });

    // Cánh hoa 3D bay lượn nhẹ nhàng theo làn gió xoắn ốc đi lên
    FLOATING_PETALS.forEach((fp, idx) => {
      const mesh = floatingPetalRefs.current[idx];
      if (!mesh) return;
      const pt = auraTime - fp.delay;
      if (pt <= 0) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      const travel = smoothstep(0, 3.8, pt);
      const angle = fp.angle + pt * 0.55;
      const spread = fp.radius * travel * (isCompact ? 0.72 : 1);

      mesh.position.set(
        flowerX + Math.cos(angle) * spread + Math.sin(pt * fp.swayFreq) * 0.18,
        flowerY + 0.15 + pt * fp.liftSpeed - 0.15 * travel,
        flowerZ + Math.sin(angle) * spread * 0.5
      );
      mesh.rotation.set(
        pt * 1.1 + fp.angle,
        pt * 0.9,
        Math.sin(pt * fp.swayFreq) * 0.8
      );
      mesh.scale.setScalar(fp.scale * sceneScale * smoothstep(0, 0.35, pt));
    });

    // Đốm phấn hoa ấm áp bay lơ lửng chậm rãi từ nhụy hoa
    if (!pollen.active && t >= T_GIRL_GRASP) {
      pollen.active = true;
      pollen.time = 0;
      for (let i = 0; i < POLLEN_COUNT; i++) {
        const a = pollen.phases[i];
        const r = 0.12 + seeded(i * 3 + 9) * 0.45;
        pollen.positions[i * 3] = flowerX + Math.cos(a) * r;
        pollen.positions[i * 3 + 1] = flowerY + 0.1 + seeded(i * 3 + 10) * 0.25;
        pollen.positions[i * 3 + 2] = flowerZ + Math.sin(a) * r * 0.6;
      }
    }

    if (pollen.active && pollenPointsRef.current) {
      pollen.time += delta;
      const posAttr = pollenPointsRef.current.geometry.attributes.position;
      for (let i = 0; i < POLLEN_COUNT; i++) {
        const phase = pollen.phases[i] + pollen.time * 1.4;
        pollen.positions[i * 3] += Math.sin(phase) * 0.22 * delta;
        pollen.positions[i * 3 + 1] += pollen.speeds[i] * delta;
        pollen.positions[i * 3 + 2] += Math.cos(phase) * 0.15 * delta;
      }
      posAttr.needsUpdate = true;
      pollenPointsRef.current.material.opacity =
        0.75 * (1 - smoothstep(3.2, 6.0, pollen.time));
    }

    // 4. Hiện lời chúc khi hoa đã nở rộ
    if (!textShownRef.current && t >= T_BLOOM_END - 0.5) {
      textShownRef.current = true;
      onTextReveal?.();
    }
  });

  let currentPetalRefIdx = 0;

  return (
    <>
      <ambientLight intensity={1.45} color="#ffe9f2" />
      <pointLight position={[2, 3, 4]} intensity={16} color="#ffd0e6" distance={15} />
      <pointLight position={[-2, -2, 3]} intensity={11} color="#ff8fc2" distance={14} />
      <directionalLight position={[0, 4, 5]} intensity={1.15} color="#fff4de" />

      {/* Bông hoa 3D nở nhiều lớp cánh */}
      <group ref={flowerGroupRef}>
        {/* Cành hoa xanh */}
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.026, 0.032, 1.32, 12]} />
          <meshStandardMaterial color="#4e8f65" roughness={0.6} />
        </mesh>

        {/* Lá hoa 2 bên */}
        <mesh
          geometry={leafGeo}
          position={[0.02, -0.35, 0]}
          rotation={[0.2, 0.4, -0.75]}
          scale={0.75}
        >
          <meshStandardMaterial color="#5ca375" side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
        <mesh
          geometry={leafGeo}
          position={[-0.02, -0.52, 0.02]}
          rotation={[-0.2, -0.3, 0.8]}
          scale={0.65}
        >
          <meshStandardMaterial color="#4e9468" side={THREE.DoubleSide} roughness={0.5} />
        </mesh>

        {/* Đài hoa */}
        <mesh position={[0, 0.02, 0]}>
          <coneGeometry args={[0.14, 0.14, 12]} />
          <meshStandardMaterial color="#52966a" roughness={0.55} />
        </mesh>

        {/* Nhị hoa vàng ấm áp phát sáng */}
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#ffe599"
            emissive="#ffbe55"
            emissiveIntensity={0.85}
            roughness={0.3}
          />
        </mesh>

        {/* Hào quang tỏa sáng tại tâm bông hoa */}
        <sprite ref={coreGlowRef} position={[0, 0.2, 0]}>
          <spriteMaterial
            map={glowTexture}
            color="#ffb3d9"
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>

        {/* 3 lớp cánh hoa 3D */}
        {PETAL_LAYERS.map((layer, layerIdx) =>
          Array.from({ length: layer.count }).map((_, i) => {
            const angle = (i / layer.count) * Math.PI * 2 + layerIdx * 0.45;
            const refIndex = currentPetalRefIdx++;
            return (
              <group
                key={`petal-${layerIdx}-${i}`}
                position={[
                  Math.sin(angle) * layer.radius,
                  layer.y,
                  Math.cos(angle) * layer.radius,
                ]}
                rotation={[0, angle, 0]}
              >
                <mesh
                  ref={(el) => {
                    petalRefs.current[refIndex] = el;
                  }}
                  geometry={petalGeo}
                  scale={layer.scale}
                  rotation={[layer.baseTilt, 0, 0]}
                >
                  <meshPhysicalMaterial
                    color={layer.color}
                    emissive="#ff5fa8"
                    emissiveIntensity={0.28}
                    roughness={0.25}
                    iridescence={0.65}
                    clearcoat={0.5}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            );
          })
        )}
      </group>

      {/* 2 vòng sóng ánh sáng dịu lan tỏa như hương hoa */}
      <mesh ref={auraRing1Ref} visible={false}>
        <ringGeometry args={[0.85, 0.94, 48]} />
        <meshBasicMaterial
          color="#ffc7e2"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={auraRing2Ref} visible={false}>
        <ringGeometry args={[0.85, 0.92, 48]} />
        <meshBasicMaterial
          color="#ffe5b8"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Cánh hoa 3D nhỏ bay lượn nhẹ nhàng */}
      {FLOATING_PETALS.map((fp, idx) => (
        <mesh
          key={`float-petal-${idx}`}
          ref={(el) => {
            floatingPetalRefs.current[idx] = el;
          }}
          geometry={petalGeo}
          visible={false}
        >
          <meshPhysicalMaterial
            color={fp.color}
            emissive="#ff70b4"
            emissiveIntensity={0.35}
            roughness={0.3}
            side={THREE.DoubleSide}
            transparent
            opacity={0.86}
          />
        </mesh>
      ))}

      {/* Phấn hoa ấm áp bay lơ lửng lên trời */}
      <points ref={pollenPointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPollen.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[initialPollen.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isCompact ? 0.14 : 0.18}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export default function WishFlowerCanvas({ onTextReveal, onReady }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.4], fov: 46 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
    >
      <FlowerScene onTextReveal={onTextReveal} />
    </Canvas>
  );
}
