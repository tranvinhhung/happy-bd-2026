"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

const CAMERA_PRESETS = {
  default: {
    position: [9, 7, 10],
    target: [0, 1.3, 0],
  },
  photo: {
    position: [0.8, 3.1, 3.6],
    target: [-2.9, 2.25, -0.85],
  },
  gift: {
    position: [4.2, 3.0, 5.4],
    target: [2.25, 0.65, 2.25],
  },
  bed: {
    position: [5.2, 4.1, 3.2],
    target: [1.25, 0.8, -1.45],
  },
  couple: {
    position: [2.5, 2.8, 5.8],
    target: [0.2, 1.25, 1.65],
  },
};

export default function RoomCamera({
  cameraTarget,
  resetVersion,
  cinematicActive = false,
}) {
  const controlsRef = useRef();

  const desiredPosition = useRef(new Vector3(9, 7, 10));
  const desiredTarget = useRef(new Vector3(0, 1.3, 0));

  const isFlying = useRef(false);
  const previousCinematic = useRef(false);

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraTarget] || CAMERA_PRESETS.default;

    desiredPosition.current.set(...preset.position);
    desiredTarget.current.set(...preset.target);

    if (!cinematicActive) {
      isFlying.current = true;
    }
  }, [cameraTarget, resetVersion, cinematicActive]);

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (cinematicActive) {
      previousCinematic.current = true;
      isFlying.current = false;
      return;
    }

    if (previousCinematic.current) {
      previousCinematic.current = false;
      isFlying.current = true;
    }

    if (!isFlying.current) return;

    const factor = 1 - Math.exp(-3.2 * delta);

    camera.position.lerp(desiredPosition.current, factor);

    controls.target.lerp(desiredTarget.current, factor);

    controls.update();

    const positionDone =
      camera.position.distanceTo(desiredPosition.current) < 0.025;

    const targetDone =
      controls.target.distanceTo(desiredTarget.current) < 0.025;

    if (positionDone && targetDone) {
      isFlying.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!cinematicActive}
      enablePan={false}
      enableZoom
      minDistance={3.4}
      maxDistance={17}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI / 2.05}
      enableDamping
      dampingFactor={0.07}
      onStart={() => {
        isFlying.current = false;
      }}
    />
  );
}
