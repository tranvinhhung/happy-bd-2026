
"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, MathUtils } from "three";

const SHOTS = [
  {
    time: 0,
    position: [7.5, 5.4, 8.5],
    target: [0, 1.4, 0.5],
  },
  {
    time: 2.5,
    position: [3.7, 3.3, 6.3],
    target: [0.2, 1.3, 1.3],
  },
  {
    time: 5.5,
    position: [2.2, 2.65, 4.8],
    target: [0.2, 1.4, 1.65],
  },
  {
    time: 9,
    position: [1.4, 2.4, 4.8],
    target: [0.2, 1.45, 1.65],
  },
  {
    time: 12,
    position: [1.4, 2.4, 4.8],
    target: [0.2, 1.45, 1.65],
  },
];

function interpolateShot(time) {
  if (time <= 0) return SHOTS[0];

  for (let i = 0; i < SHOTS.length - 1; i++) {
    const from = SHOTS[i];
    const to = SHOTS[i + 1];

    if (time <= to.time) {
      const progress =
        (time - from.time) / (to.time - from.time);

      const eased =
        progress * progress * (3 - 2 * progress);

      return {
        position: from.position.map((value, index) =>
          MathUtils.lerp(value, to.position[index], eased)
        ),
        target: from.target.map((value, index) =>
          MathUtils.lerp(value, to.target[index], eased)
        ),
      };
    }
  }

  return SHOTS[SHOTS.length - 1];
}

export default function CinematicCamera({
  active = false,
  progress = 0,
}) {
  const { camera } = useThree();

  const lookAtRef = useRef(new Vector3(0, 1.3, 0));

  useFrame((_, delta) => {
    if (!active) return;

    const shot = interpolateShot(progress);
    const factor = 1 - Math.exp(-4 * delta);

    const nextPosition = new Vector3(...shot.position);
    const nextTarget = new Vector3(...shot.target);

    camera.position.lerp(nextPosition, factor);
    lookAtRef.current.lerp(nextTarget, factor);

    camera.lookAt(lookAtRef.current);
  });

  return null;
}
