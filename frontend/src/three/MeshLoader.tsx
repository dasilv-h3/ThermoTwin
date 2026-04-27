import { Suspense, useMemo } from 'react';
import { useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import type { Group, Object3D } from 'three';

export type MeshFormat = 'gltf' | 'glb' | 'obj';

type Props = {
  source: { uri: string; format: MeshFormat };
  fallback?: React.ReactNode;
};

function GltfNode({ uri }: { uri: string }) {
  const gltf = useLoader(GLTFLoader, uri) as unknown as { scene: Group };
  return <primitive object={gltf.scene} />;
}

function ObjNode({ uri }: { uri: string }) {
  const obj = useLoader(OBJLoader, uri) as unknown as Object3D;
  return <primitive object={obj} />;
}

function InnerLoader({ source }: { source: Props['source'] }) {
  const key = useMemo(() => `${source.format}:${source.uri}`, [source]);
  if (source.format === 'gltf' || source.format === 'glb') {
    return <GltfNode key={key} uri={source.uri} />;
  }
  if (source.format === 'obj') {
    return <ObjNode key={key} uri={source.uri} />;
  }
  return null;
}

export default function MeshLoader({ source, fallback = null }: Props) {
  return (
    <Suspense fallback={fallback}>
      <InnerLoader source={source} />
    </Suspense>
  );
}
