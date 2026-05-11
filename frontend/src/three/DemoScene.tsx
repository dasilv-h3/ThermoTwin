import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import type { Mesh } from 'three';

type Props = {
  color?: string;
  spinSpeed?: number;
};

export default function DemoScene({ color = '#2f9e44', spinSpeed = 0.4 }: Props) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * spinSpeed;
    meshRef.current.rotation.y += delta * spinSpeed * 1.3;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  );
}
