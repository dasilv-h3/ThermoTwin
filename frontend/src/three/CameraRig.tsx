import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber/native';
import type { Vector3Tuple } from 'three';

export type CameraMode = 'orbit' | 'fixed' | 'follow';

type Props = {
  mode?: CameraMode;
  position?: Vector3Tuple;
  target?: Vector3Tuple;
  fov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

export default function CameraRig({
  mode = 'orbit',
  position = [3, 2.5, 3],
  target = [0, 0, 0],
  fov = 50,
  autoRotate = false,
  autoRotateSpeed = 0.5,
}: Props) {
  const { camera } = useThree();
  const angleRef = useRef(0);

  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
    if ('fov' in camera) {
      (camera as { fov: number }).fov = fov;
      (camera as { updateProjectionMatrix: () => void }).updateProjectionMatrix();
    }
  }, [camera, position, target, fov]);

  useEffect(() => {
    if (mode !== 'orbit' || !autoRotate) return undefined;
    let raf = 0;
    const radius = Math.hypot(position[0] - target[0], position[2] - target[2]);
    const height = position[1];
    const tick = () => {
      angleRef.current += autoRotateSpeed * 0.016;
      camera.position.set(
        target[0] + Math.cos(angleRef.current) * radius,
        height,
        target[2] + Math.sin(angleRef.current) * radius,
      );
      camera.lookAt(target[0], target[1], target[2]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, autoRotate, autoRotateSpeed, camera, position, target]);

  return null;
}
