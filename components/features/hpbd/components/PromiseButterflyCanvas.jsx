"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TRAIL_COUNT = 360;
const BURST_COUNT = 480;

const MINI_BUTTERFLIES = [
  { orbitRadius: 1.35, orbitSpeed: 2.3, yOffset: 0.45, phase: 0.2, scale: 0.26, flapSpeed: 21, tint: "#ffb8dc" },
  { orbitRadius: 1.65, orbitSpeed: -1.9, yOffset: -0.35, phase: 1.7, scale: 0.21, flapSpeed: 24, tint: "#ffe0b8" },
  { orbitRadius: 1.15, orbitSpeed: 2.7, yOffset: 0.75, phase: 3.1, scale: 0.24, flapSpeed: 22, tint: "#ff8ec6" },
  { orbitRadius: 1.85, orbitSpeed: -2.2, yOffset: 0.15, phase: 4.4, scale: 0.28, flapSpeed: 19, tint: "#f6b8ff" },
  { orbitRadius: 1.45, orbitSpeed: 2.0, yOffset: -0.65, phase: 5.3, scale: 0.19, flapSpeed: 26, tint: "#ffd6e8" },
  { orbitRadius: 1.25, orbitSpeed: -2.5, yOffset: 0.55, phase: 2.5, scale: 0.22, flapSpeed: 23, tint: "#ff9ed0" },
];

// Giai đoạn thời gian (giây)
const T_ASCEND_END = 3.5;   // Bay từ dưới lên đỉnh + xoay vòng
const T_APPROACH_END = 5.6; // Bay về trung tâm & tiến sát màn hình
const T_DISSOLVE_END = 6.5; // Bướm tan biến & nổ kim tuyến

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
  grad.addColorStop(0.22, "rgba(255, 224, 240, 0.98)");
  grad.addColorStop(0.5, "rgba(255, 136, 196, 0.52)");
  grad.addColorStop(0.8, "rgba(255, 185, 220, 0.14)");
  grad.addColorStop(1, "rgba(255, 130, 188, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createWingTextures() {
  // 1. Color Map 1024x1024 siêu chi tiết: ngọc trai - hồng cánh sen - tím oải hương - viền ren rose gold
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1024;
  colorCanvas.height = 1024;
  const ctx = colorCanvas.getContext("2d");

  const baseGrad = ctx.createRadialGradient(140, 512, 30, 500, 512, 720);
  baseGrad.addColorStop(0, "#fffafd");
  baseGrad.addColorStop(0.18, "#ffd9eb");
  baseGrad.addColorStop(0.45, "#ff8ec5");
  baseGrad.addColorStop(0.7, "#ea539c");
  baseGrad.addColorStop(0.86, "#b83b84");
  baseGrad.addColorStop(0.95, "#f7c4d8");
  baseGrad.addColorStop(1, "#ffe7cf");

  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Ánh xà cừ hồng tím & vàng hồng loang mềm
  const iridGrad = ctx.createLinearGradient(100, 140, 920, 880);
  iridGrad.addColorStop(0, "rgba(255, 245, 214, 0.34)");
  iridGrad.addColorStop(0.42, "rgba(255, 165, 218, 0.2)");
  iridGrad.addColorStop(0.75, "rgba(198, 142, 255, 0.28)");
  iridGrad.addColorStop(1, "rgba(255, 218, 185, 0.3)");
  ctx.fillStyle = iridGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Hệ thống gân cánh chính + gân phụ phân nhánh mượt mà
  ctx.lineCap = "round";
  for (let i = 0; i < 11; i++) {
    const angle = -0.88 + i * 0.175;
    const ctrlX = 430;
    const ctrlY = 512 + Math.sin(angle) * 260;
    const endX = 950;
    const endY = 512 + Math.sin(angle) * 450;

    // Quầng sáng dịu quanh gân
    ctx.strokeStyle = "rgba(255, 215, 236, 0.28)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(55, 512);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();

    // Lõi gân ngọc trai
    ctx.strokeStyle = "rgba(255, 248, 252, 0.72)";
    ctx.lineWidth = i % 2 === 0 ? 5.5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(55, 512);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();

    // Nhánh phụ ánh rose gold
    ctx.strokeStyle = "rgba(255, 229, 190, 0.45)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(ctrlX + 80, (512 + endY) * 0.5);
    ctx.quadraticCurveTo(ctrlX + 240, endY - 45, endX - 25, endY - 76);
    ctx.stroke();
  }

  // Viền ren ngọc trai lượn sóng theo mép ngoài cánh
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const px = 860 - Math.pow(t - 0.5, 2) * 320;
    const py = 110 + t * 800;
    const laceGrad = ctx.createRadialGradient(px, py, 0, px, py, 24);
    laceGrad.addColorStop(0, "rgba(255, 250, 230, 0.92)");
    laceGrad.addColorStop(0.5, "rgba(255, 210, 228, 0.45)");
    laceGrad.addColorStop(1, "rgba(255, 160, 205, 0)");
    ctx.fillStyle = laceGrad;
    ctx.beginPath();
    ctx.arc(px, py, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Đốm mắt bướm phát sáng (eyespots) tinh tế
  [
    { x: 700, y: 270, r: 44 },
    { x: 650, y: 740, r: 36 },
  ].forEach(({ x, y, r }) => {
    const eyeGrad = ctx.createRadialGradient(x, y, 2, x, y, r);
    eyeGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    eyeGrad.addColorStop(0.32, "rgba(255, 232, 185, 0.85)");
    eyeGrad.addColorStop(0.65, "rgba(255, 130, 195, 0.45)");
    eyeGrad.addColorStop(1, "rgba(255, 130, 195, 0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Bụi kim tuyến mịn màng khắp cánh
  for (let i = 0; i < 180; i++) {
    const px = 140 + seeded(i * 5 + 1) * 780;
    const py = 95 + seeded(i * 5 + 2) * 820;
    const radius = 1.8 + seeded(i * 5 + 3) * 5.6;

    if (i % 10 === 0) {
      const spotGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * 3.4);
      spotGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      spotGrad.addColorStop(0.45, "rgba(255, 222, 178, 0.6)");
      spotGrad.addColorStop(1, "rgba(255, 150, 200, 0)");
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(px, py, radius * 3.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle =
        i % 3 === 0
          ? "rgba(255, 244, 200, 0.88)"
          : "rgba(255, 255, 255, 0.78)";
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Emissive Map để các đường gân, viền ren và đốm kim tuyến tự phát sáng dịu
  const emissiveCanvas = document.createElement("canvas");
  emissiveCanvas.width = 512;
  emissiveCanvas.height = 512;
  const eCtx = emissiveCanvas.getContext("2d");
  eCtx.fillStyle = "#4d1230";
  eCtx.fillRect(0, 0, 512, 512);
  eCtx.globalAlpha = 0.82;
  eCtx.drawImage(colorCanvas, 0, 0, 512, 512);

  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.needsUpdate = true;

  const emissiveTexture = new THREE.CanvasTexture(emissiveCanvas);
  emissiveTexture.colorSpace = THREE.SRGBColorSpace;
  emissiveTexture.needsUpdate = true;

  return { colorTexture, emissiveTexture };
}

function createUpperWingGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.09);
  shape.bezierCurveTo(0.38, 0.72, 1.26, 1.12, 1.62, 0.76);
  shape.bezierCurveTo(1.82, 0.54, 1.64, -0.08, 1.16, -0.23);
  shape.bezierCurveTo(0.7, -0.35, 0.24, -0.16, 0, -0.05);
  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape, 40);
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const bendZ = Math.sin(Math.min(1, x / 1.65) * Math.PI) * 0.09 + x * x * 0.025;
    pos.setZ(i, bendZ);
    uv.setXY(
      i,
      Math.min(1, Math.max(0, x / 1.7)),
      Math.min(1, Math.max(0, (y + 0.35) / 1.45))
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createLowerWingGeometry() {
  // Cánh dưới có đuôi bướm phượng (swallowtail) uốn lượn thanh thoát
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.02);
  shape.bezierCurveTo(0.45, -0.1, 1.12, -0.26, 1.16, -0.62);
  shape.bezierCurveTo(1.18, -0.84, 0.94, -0.96, 0.82, -1.04);
  shape.bezierCurveTo(0.9, -1.24, 0.82, -1.36, 0.68, -1.32);
  shape.bezierCurveTo(0.56, -1.26, 0.52, -1.08, 0.38, -1.02);
  shape.bezierCurveTo(0.18, -0.9, 0.08, -0.48, 0, -0.18);
  shape.closePath();

  const geometry = new THREE.ShapeGeometry(shape, 36);
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const bendZ = Math.sin(Math.min(1, x / 1.2) * Math.PI) * 0.065 - y * 0.03;
    pos.setZ(i, bendZ);
    uv.setXY(
      i,
      Math.min(1, Math.max(0, x / 1.25)),
      Math.min(1, Math.max(0, (y + 1.38) / 1.38))
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createAntennaGeometry(side) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.025, 0.04, 0.37),
    new THREE.Vector3(side * 0.055, 0.14, 0.48),
    new THREE.Vector3(side * 0.11, 0.24, 0.56),
    new THREE.Vector3(side * 0.15, 0.28, 0.59),
  ]);
  return new THREE.TubeGeometry(curve, 16, 0.007, 8, false);
}

function createTrailState() {
  const positions = new Float32Array(TRAIL_COUNT * 3);
  const colors = new Float32Array(TRAIL_COUNT * 3);
  const velocities = new Float32Array(TRAIL_COUNT * 3);
  const ages = new Float32Array(TRAIL_COUNT);
  const lifetimes = new Float32Array(TRAIL_COUNT);

  for (let i = 0; i < TRAIL_COUNT; i++) {
    ages[i] = 99;
    lifetimes[i] = 0.9 + (i % 7) * 0.14;
    positions[i * 3 + 2] = -999;

    const palette = ["#ffe7f4", "#ffd9a8", "#ff87c2", "#ffc0df"];
    const c = new THREE.Color(palette[i % palette.length]);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  return {
    positions,
    colors,
    velocities,
    ages,
    lifetimes,
    cursor: 0,
    spawnAcc: 0,
  };
}

function createBurstState() {
  const positions = new Float32Array(BURST_COUNT * 3);
  const colors = new Float32Array(BURST_COUNT * 3);
  const velocities = new Float32Array(BURST_COUNT * 3);

  for (let i = 0; i < BURST_COUNT; i++) {
    positions[i * 3 + 2] = -999;

    const theta = seeded(i * 3 + 1) * Math.PI * 2;
    const phi = Math.acos(2 * seeded(i * 3 + 2) - 1);
    const speed = 1.6 + seeded(i * 3 + 3) * 5.8;

    velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed * 1.25;
    velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed * 1.05;
    velocities[i * 3 + 2] = Math.cos(phi) * speed * 0.65;

    const palette = ["#ff7ebe", "#ffb8da", "#fff1f8", "#ffe0a3", "#f85ca9"];
    const c = new THREE.Color(palette[i % palette.length]);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  return { positions, colors, velocities, active: false, time: 0 };
}

function ButterflyShow({ onTextReveal, onComplete }) {
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const isCompact = aspect < 0.85;
  const pathXScale = Math.min(1, Math.max(0.42, aspect * 0.92));
  const butterflyBaseScale = aspect < 0.68 ? 0.66 : aspect < 1.0 ? 0.84 : 1.05;

  const butterflyRef = useRef(null);
  const leftWingRef = useRef(null);
  const rightWingRef = useRef(null);
  const wingMaterialsRef = useRef([]);
  const bodyMaterialsRef = useRef([]);
  const antennaMaterialsRef = useRef([]);
  const haloRef = useRef(null);

  const miniGroupsRef = useRef([]);
  const miniLeftWingsRef = useRef([]);
  const miniRightWingsRef = useRef([]);
  const miniMaterialsRef = useRef([]);

  const trailPointsRef = useRef(null);
  const burstPointsRef = useRef(null);

  const elapsedRef = useRef(0);
  const textShownRef = useRef(false);
  const burstTriggeredRef = useRef(false);
  const completedRef = useRef(false);

  const glowTexture = useMemo(() => createGlowTexture(), []);
  const { colorTexture, emissiveTexture } = useMemo(() => createWingTextures(), []);
  const upperWingGeo = useMemo(() => createUpperWingGeometry(), []);
  const lowerWingGeo = useMemo(() => createLowerWingGeometry(), []);
  const leftAntennaGeo = useMemo(() => createAntennaGeometry(-1), []);
  const rightAntennaGeo = useMemo(() => createAntennaGeometry(1), []);

  useEffect(() => {
    return () => {
      glowTexture.dispose();
      colorTexture.dispose();
      emissiveTexture.dispose();
      upperWingGeo.dispose();
      lowerWingGeo.dispose();
      leftAntennaGeo.dispose();
      rightAntennaGeo.dispose();
    };
  }, [
    glowTexture,
    colorTexture,
    emissiveTexture,
    upperWingGeo,
    lowerWingGeo,
    leftAntennaGeo,
    rightAntennaGeo,
  ]);

  // Lưu trạng thái hạt trong ref để an toàn với React Compiler
  const trailRef = useRef(null);
  const burstRef = useRef(null);

  // Dữ liệu mảng ban đầu để gắn bufferAttribute
  const initialTrail = useMemo(() => createTrailState(), []);
  const initialBurst = useMemo(() => createBurstState(), []);

  useEffect(() => {
    trailRef.current = createTrailState();
    burstRef.current = createBurstState();
    if (trailPointsRef.current) {
      trailRef.current.positions = trailPointsRef.current.geometry.attributes.position.array;
    }
    if (burstPointsRef.current) {
      burstRef.current.positions = burstPointsRef.current.geometry.attributes.position.array;
    }
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    const butterfly = butterflyRef.current;
    const trailData = trailRef.current;
    const burstData = burstRef.current;
    if (!butterfly || !trailData || !burstData) return;

    // 1. Tính vị trí & góc xoay chú bướm theo từng giai đoạn
    let px = 0;
    let py = -4.2;
    let pz = -2.2;
    let rx = 0.35;
    let ry = 0;
    let rz = 0;
    let scale = 1.15;
    let opacity = 1;
    let flapSpeed = 16;

    if (t <= T_ASCEND_END) {
      // Bay từ dưới lên đỉnh màn hình + xoay vòng xoắn ốc mượt mà
      const p = smoothstep(0, T_ASCEND_END, t);
      const spiral = p * Math.PI * 2.25;
      const radius = 1.85 * pathXScale * Math.sin(p * Math.PI * 0.92);

      px = Math.sin(spiral) * radius;
      py = -3.7 + p * 6.2;
      pz = -2.1 + Math.cos(spiral) * 1.05 + p * 0.85;

      // Xoay vòng theo tiếp tuyến đường bay
      ry = spiral + Math.PI * 0.5;
      rx = 0.45 + Math.sin(t * 2.4) * 0.1;
      rz = -Math.cos(spiral) * 0.25;
      scale = butterflyBaseScale * (0.92 + p * 0.3);
      flapSpeed = 16.5;
    } else if (t <= T_APPROACH_END) {
      // Từ gần đỉnh bay lượn về trung tâm rồi tiến sát lại gần màn hình
      const p = smoothstep(T_ASCEND_END, T_APPROACH_END, t);
      const startX =
        Math.sin(Math.PI * 2.25) * 1.85 * pathXScale * Math.sin(Math.PI * 0.92);
      const startY = 2.5;
      const startZ = -2.1 + Math.cos(Math.PI * 2.25) * 1.05 + 0.85;

      const centerMix = smoothstep(0, 0.48, p);
      const zoomMix = smoothstep(0.22, 1, p);

      px =
        THREE.MathUtils.lerp(startX, 0, centerMix) +
        Math.sin(p * Math.PI) * 0.3 * pathXScale * (1 - p);
      py = THREE.MathUtils.lerp(startY, 0.06, centerMix);
      pz = THREE.MathUtils.lerp(startZ, isCompact ? 3.25 : 3.65, zoomMix);

      const startRy = Math.PI * 2.25 + Math.PI * 0.5;
      ry = THREE.MathUtils.lerp(startRy, Math.PI * 2, smoothstep(0, 0.55, p));
      rx = THREE.MathUtils.lerp(0.45, 0.58, zoomMix);
      rz = THREE.MathUtils.lerp(-0.2, Math.sin(t * 2.2) * 0.05, centerMix);
      scale = butterflyBaseScale * (1.22 + zoomMix * 0.36);
      flapSpeed = THREE.MathUtils.lerp(15, 9.5, zoomMix);
    } else if (t <= T_DISSOLVE_END) {
      // Tan biến từ từ ngay trước màn hình
      const p = smoothstep(T_APPROACH_END, T_DISSOLVE_END, t);
      px = Math.sin(t * 5) * 0.03 * (1 - p);
      py = 0.06 + p * 0.16;
      pz = (isCompact ? 3.25 : 3.65) + p * 0.35;
      rx = 0.58 + p * 0.15;
      ry = Math.PI * 2;
      rz = 0;
      scale = butterflyBaseScale * (1.58 + p * 0.32);
      opacity = 1 - p;
      flapSpeed = 7.5;

      if (!burstTriggeredRef.current && p >= 0.25) {
        burstTriggeredRef.current = true;
        burstData.active = true;
        burstData.time = 0;
        const posArr = burstData.positions;
        for (let i = 0; i < BURST_COUNT; i++) {
          posArr[i * 3] = px + (Math.random() - 0.5) * 0.45;
          posArr[i * 3 + 1] = py + (Math.random() - 0.5) * 0.35;
          posArr[i * 3 + 2] = pz - 0.35 + (Math.random() - 0.5) * 0.3;
        }
      }
    } else {
      opacity = 0;
    }

    // Nhịp vỗ cánh & nhấp nhô thân bướm tự nhiên theo vật lý
    const flapPhase = t * flapSpeed;
    const flapAngle = Math.sin(flapPhase) * 0.78 + 0.14;
    const bodyLift = -Math.sin(flapPhase) * 0.045;

    butterfly.position.set(px, py + bodyLift, pz);
    butterfly.rotation.set(rx, ry, rz);
    butterfly.scale.setScalar(scale);
    butterfly.visible = opacity > 0.01;

    if (leftWingRef.current && rightWingRef.current) {
      leftWingRef.current.rotation.y = -flapAngle;
      rightWingRef.current.rotation.y = flapAngle;
    }

    if (haloRef.current) {
      haloRef.current.material.opacity = opacity * (0.28 + Math.sin(t * 4) * 0.06);
      haloRef.current.scale.setScalar(2.4 + Math.sin(t * 3) * 0.18);
    }

    // Cập nhật độ mờ khi tan biến
    wingMaterialsRef.current.forEach((mat) => {
      if (mat) mat.opacity = opacity * 0.96;
    });
    bodyMaterialsRef.current.forEach((mat) => {
      if (mat) mat.opacity = opacity;
    });
    antennaMaterialsRef.current.forEach((mat) => {
      if (mat) mat.opacity = opacity * 0.92;
    });

    // Cập nhật 6 chú bướm con bay lượn xung quanh chú bướm chính
    const orbitTighten = t > T_ASCEND_END ? smoothstep(T_ASCEND_END, T_APPROACH_END, t) : 0;
    MINI_BUTTERFLIES.forEach((mini, idx) => {
      const group = miniGroupsRef.current[idx];
      if (!group) return;

      const angle = t * mini.orbitSpeed + mini.phase;
      const r = mini.orbitRadius * pathXScale * (1 - orbitTighten * 0.35);
      const mx = px + Math.cos(angle) * r;
      const my =
        py +
        mini.yOffset * (1 - orbitTighten * 0.4) +
        Math.sin(t * 2.2 + mini.phase) * 0.25;
      const mz = pz - 0.35 + Math.sin(angle) * r * 0.65;

      group.position.set(mx, my, mz);
      group.rotation.set(
        0.4 + Math.sin(t * 2 + idx) * 0.15,
        angle + (mini.orbitSpeed > 0 ? Math.PI : 0),
        Math.cos(angle) * 0.22
      );
      group.scale.setScalar(mini.scale * butterflyBaseScale * (1 + orbitTighten * 0.2));
      group.visible = opacity > 0.01;

      const miniFlap = Math.sin(t * mini.flapSpeed + mini.phase) * 0.8 + 0.15;
      const lw = miniLeftWingsRef.current[idx];
      const rw = miniRightWingsRef.current[idx];
      if (lw && rw) {
        lw.rotation.y = -miniFlap;
        rw.rotation.y = miniFlap;
      }

      const matStart = idx * 4;
      for (let m = 0; m < 4; m++) {
        const mat = miniMaterialsRef.current[matStart + m];
        if (mat) mat.opacity = opacity * 0.88;
      }
    });

    // 2. Rải hạt kim tuyến từ cả thân và 2 đầu cánh
    if (t <= T_DISSOLVE_END) {
      trailData.spawnAcc += delta * (t <= T_APPROACH_END ? 95 : 35);
      while (trailData.spawnAcc >= 1) {
        trailData.spawnAcc -= 1;
        const idx = trailData.cursor;
        trailData.cursor = (trailData.cursor + 1) % TRAIL_COUNT;

        // Xen kẽ phát hạt từ đầu cánh trái, đầu cánh phải, và giữa thân
        const wingOffset =
          idx % 3 === 0 ? -0.65 * scale : idx % 3 === 1 ? 0.65 * scale : 0;

        trailData.positions[idx * 3] =
          px + wingOffset * Math.cos(ry) + (Math.random() - 0.5) * 0.28;
        trailData.positions[idx * 3 + 1] =
          py + bodyLift + (Math.random() - 0.5) * 0.25;
        trailData.positions[idx * 3 + 2] =
          pz - 0.1 + wingOffset * Math.sin(ry) + (Math.random() - 0.5) * 0.22;

        trailData.velocities[idx * 3] = (Math.random() - 0.5) * 0.45;
        trailData.velocities[idx * 3 + 1] = -0.22 - Math.random() * 0.45;
        trailData.velocities[idx * 3 + 2] = (Math.random() - 0.5) * 0.3;
        trailData.ages[idx] = 0;
      }
    }

    if (trailPointsRef.current) {
      const posAttr = trailPointsRef.current.geometry.attributes.position;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        if (trailData.ages[i] < trailData.lifetimes[i]) {
          trailData.ages[i] += delta;
          trailData.positions[i * 3] += trailData.velocities[i * 3] * delta;
          trailData.positions[i * 3 + 1] += trailData.velocities[i * 3 + 1] * delta;
          trailData.positions[i * 3 + 2] += trailData.velocities[i * 3 + 2] * delta;
          if (trailData.ages[i] >= trailData.lifetimes[i]) {
            trailData.positions[i * 3 + 2] = -999;
          }
        }
      }
      posAttr.needsUpdate = true;
    }

    // 3. Cập nhật vụ nổ kim tuyến khắp màn hình
    if (burstData.active && burstPointsRef.current) {
      burstData.time += delta;
      const posAttr = burstPointsRef.current.geometry.attributes.position;
      const drag = Math.pow(0.45, delta);

      for (let i = 0; i < BURST_COUNT; i++) {
        burstData.velocities[i * 3] *= drag;
        burstData.velocities[i * 3 + 1] =
          burstData.velocities[i * 3 + 1] * drag - 0.65 * delta; // Rơi nhẹ
        burstData.velocities[i * 3 + 2] *= drag;

        burstData.positions[i * 3] += burstData.velocities[i * 3] * delta;
        burstData.positions[i * 3 + 1] += burstData.velocities[i * 3 + 1] * delta;
        burstData.positions[i * 3 + 2] += burstData.velocities[i * 3 + 2] * delta;
      }
      posAttr.needsUpdate = true;

      const burstMat = burstPointsRef.current.material;
      burstMat.opacity = Math.max(0, 1 - smoothstep(1.2, 3.0, burstData.time));
    }

    // 4. Kích hoạt hiện dòng chữ cuối cùng
    if (!textShownRef.current && t >= 6.0) {
      textShownRef.current = true;
      onTextReveal?.();
    }

    if (!completedRef.current && t >= 9.0) {
      completedRef.current = true;
      onComplete?.();
    }
  });

  return (
    <>
      <ambientLight intensity={1.45} color="#ffe3f0" />
      <pointLight position={[2, 3, 5]} intensity={16} color="#ffc2e0" distance={16} />
      <pointLight position={[-3, -2, 3]} intensity={10} color="#ff7ab8" distance={15} />
      <directionalLight position={[0, 4, 4]} intensity={1.2} color="#fff2d9" />

      {/* Chú bướm 3D màu hồng óng ánh */}
      <group ref={butterflyRef}>
        {/* Hào quang hồng dịu quanh bướm */}
        <sprite ref={haloRef} position={[0, 0, -0.05]}>
          <spriteMaterial
            map={glowTexture}
            color="#ff99cc"
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>

        {/* Ngực (thorax) */}
        <mesh position={[0, 0.01, 0.12]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.35, 1.15]}>
          <sphereGeometry args={[0.056, 16, 16]} />
          <meshPhysicalMaterial
            ref={(el) => {
              bodyMaterialsRef.current[0] = el;
            }}
            color="#ffeaf4"
            emissive="#ff6eb4"
            emissiveIntensity={0.68}
            roughness={0.22}
            metalness={0.22}
            clearcoat={0.85}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Bụng thuôn dài (abdomen) */}
        <mesh position={[0, -0.02, -0.18]} rotation={[Math.PI / 2 + 0.06, 0, 0]} scale={[0.85, 1, 0.85]}>
          <capsuleGeometry args={[0.036, 0.44, 10, 18]} />
          <meshPhysicalMaterial
            ref={(el) => {
              bodyMaterialsRef.current[1] = el;
            }}
            color="#ffd4e8"
            emissive="#ff5ca8"
            emissiveIntensity={0.55}
            roughness={0.25}
            metalness={0.2}
            clearcoat={0.8}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Đầu bướm */}
        <mesh position={[0, 0.025, 0.31]}>
          <sphereGeometry args={[0.052, 16, 16]} />
          <meshPhysicalMaterial
            ref={(el) => {
              bodyMaterialsRef.current[2] = el;
            }}
            color="#fff2f8"
            emissive="#ff85c1"
            emissiveIntensity={0.65}
            roughness={0.2}
            clearcoat={0.85}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Đôi mắt tròn long lanh */}
        {[-1, 1].map((side, idx) => (
          <mesh key={`eye-${side}`} position={[side * 0.036, 0.038, 0.345]}>
            <sphereGeometry args={[0.017, 10, 10]} />
            <meshBasicMaterial
              ref={(el) => {
                bodyMaterialsRef.current[3 + idx] = el;
              }}
              color="#fff6db"
              transparent
              opacity={1}
            />
          </mesh>
        ))}

        {/* Râu cong mềm mại & hạt ngọc phát sáng ở đầu râu */}
        {[leftAntennaGeo, rightAntennaGeo].map((geo, idx) => {
          const side = idx === 0 ? -1 : 1;
          return (
            <group key={`ant-${side}`}>
              <mesh geometry={geo}>
                <meshBasicMaterial
                  ref={(el) => {
                    antennaMaterialsRef.current[idx * 2] = el;
                  }}
                  color="#ffe4f2"
                  transparent
                  opacity={0.92}
                />
              </mesh>
              <mesh position={[side * 0.15, 0.28, 0.59]}>
                <sphereGeometry args={[0.018, 10, 10]} />
                <meshBasicMaterial
                  ref={(el) => {
                    antennaMaterialsRef.current[idx * 2 + 1] = el;
                  }}
                  color="#fff3cf"
                  transparent
                  opacity={0.96}
                />
              </mesh>
            </group>
          );
        })}

        {/* Cánh phải */}
        <group ref={rightWingRef} position={[0.03, 0, 0.02]}>
          <mesh geometry={upperWingGeo}>
            <meshPhysicalMaterial
              ref={(el) => {
                wingMaterialsRef.current[0] = el;
              }}
              map={colorTexture}
              emissive="#ff70b6"
              emissiveMap={emissiveTexture}
              emissiveIntensity={0.58}
              roughness={0.22}
              metalness={0.18}
              iridescence={1}
              iridescenceIOR={1.38}
              clearcoat={0.85}
              clearcoatRoughness={0.15}
              side={THREE.DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>
          <mesh geometry={lowerWingGeo}>
            <meshPhysicalMaterial
              ref={(el) => {
                wingMaterialsRef.current[1] = el;
              }}
              map={colorTexture}
              emissive="#ff70b6"
              emissiveMap={emissiveTexture}
              emissiveIntensity={0.55}
              roughness={0.22}
              metalness={0.18}
              iridescence={1}
              iridescenceIOR={1.38}
              clearcoat={0.85}
              clearcoatRoughness={0.15}
              side={THREE.DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Cánh trái (lật đối xứng) */}
        <group ref={leftWingRef} position={[-0.03, 0, 0.02]} scale={[-1, 1, 1]}>
          <mesh geometry={upperWingGeo}>
            <meshPhysicalMaterial
              ref={(el) => {
                wingMaterialsRef.current[2] = el;
              }}
              map={colorTexture}
              emissive="#ff70b6"
              emissiveMap={emissiveTexture}
              emissiveIntensity={0.58}
              roughness={0.22}
              metalness={0.18}
              iridescence={1}
              iridescenceIOR={1.38}
              clearcoat={0.85}
              clearcoatRoughness={0.15}
              side={THREE.DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>
          <mesh geometry={lowerWingGeo}>
            <meshPhysicalMaterial
              ref={(el) => {
                wingMaterialsRef.current[3] = el;
              }}
              map={colorTexture}
              emissive="#ff70b6"
              emissiveMap={emissiveTexture}
              emissiveIntensity={0.55}
              roughness={0.22}
              metalness={0.18}
              iridescence={1}
              iridescenceIOR={1.38}
              clearcoat={0.85}
              clearcoatRoughness={0.15}
              side={THREE.DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>

      {/* 6 chú bướm con nhỏ nhỏ bay lượn xung quanh */}
      {MINI_BUTTERFLIES.map((mini, idx) => (
        <group
          key={`mini-${idx}`}
          ref={(el) => {
            miniGroupsRef.current[idx] = el;
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.035, 0.38, 6, 10]} />
            <meshBasicMaterial color={mini.tint} transparent opacity={0.9} />
          </mesh>

          <group
            ref={(el) => {
              miniRightWingsRef.current[idx] = el;
            }}
            position={[0.02, 0, 0]}
          >
            <mesh geometry={upperWingGeo}>
              <meshPhysicalMaterial
                ref={(el) => {
                  miniMaterialsRef.current[idx * 4] = el;
                }}
                color={mini.tint}
                map={colorTexture}
                emissive={mini.tint}
                emissiveMap={emissiveTexture}
                emissiveIntensity={0.6}
                iridescence={0.9}
                roughness={0.25}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={lowerWingGeo}>
              <meshPhysicalMaterial
                ref={(el) => {
                  miniMaterialsRef.current[idx * 4 + 1] = el;
                }}
                color={mini.tint}
                map={colorTexture}
                emissive={mini.tint}
                emissiveMap={emissiveTexture}
                emissiveIntensity={0.6}
                iridescence={0.9}
                roughness={0.25}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
              />
            </mesh>
          </group>

          <group
            ref={(el) => {
              miniLeftWingsRef.current[idx] = el;
            }}
            position={[-0.02, 0, 0]}
            scale={[-1, 1, 1]}
          >
            <mesh geometry={upperWingGeo}>
              <meshPhysicalMaterial
                ref={(el) => {
                  miniMaterialsRef.current[idx * 4 + 2] = el;
                }}
                color={mini.tint}
                map={colorTexture}
                emissive={mini.tint}
                emissiveMap={emissiveTexture}
                emissiveIntensity={0.6}
                iridescence={0.9}
                roughness={0.25}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={lowerWingGeo}>
              <meshPhysicalMaterial
                ref={(el) => {
                  miniMaterialsRef.current[idx * 4 + 3] = el;
                }}
                color={mini.tint}
                map={colorTexture}
                emissive={mini.tint}
                emissiveMap={emissiveTexture}
                emissiveIntensity={0.6}
                iridescence={0.9}
                roughness={0.25}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>
      ))}

      {/* Vệt kim tuyến theo đường bay */}
      <points ref={trailPointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialTrail.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[initialTrail.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isCompact ? 0.16 : 0.22}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Vụ nổ kim tuyến khắp màn hình */}
      <points ref={burstPointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[initialBurst.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[initialBurst.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isCompact ? 0.2 : 0.27}
          map={glowTexture}
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export default function PromiseButterflyCanvas({ onTextReveal, onComplete }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.2], fov: 48 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ButterflyShow onTextReveal={onTextReveal} onComplete={onComplete} />
    </Canvas>
  );
}
