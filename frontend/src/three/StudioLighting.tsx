import type { Vector3Tuple } from 'three';

export type LightingPreset = 'studio' | 'outdoor' | 'heatmap';

type Props = {
  preset?: LightingPreset;
  shadows?: boolean;
};

type Setup = {
  ambient: number;
  hemi: { sky: string; ground: string; intensity: number };
  key: { position: Vector3Tuple; intensity: number; color: string };
  fill: { position: Vector3Tuple; intensity: number; color: string };
  rim: { position: Vector3Tuple; intensity: number; color: string };
};

const PRESETS: Record<LightingPreset, Setup> = {
  studio: {
    ambient: 0.35,
    hemi: { sky: '#bfd7ff', ground: '#3a4a6b', intensity: 0.3 },
    key: { position: [5, 6, 5], intensity: 1.1, color: '#ffffff' },
    fill: { position: [-4, 3, 2], intensity: 0.5, color: '#d0e1ff' },
    rim: { position: [0, 4, -6], intensity: 0.6, color: '#ffeccc' },
  },
  outdoor: {
    ambient: 0.25,
    hemi: { sky: '#cde3ff', ground: '#4c6e3d', intensity: 0.6 },
    key: { position: [8, 10, 4], intensity: 1.5, color: '#fff6e0' },
    fill: { position: [-6, 4, 3], intensity: 0.3, color: '#d0e7ff' },
    rim: { position: [0, 6, -8], intensity: 0.4, color: '#ffe7c2' },
  },
  heatmap: {
    ambient: 0.5,
    hemi: { sky: '#ffffff', ground: '#b0b0b0', intensity: 0.4 },
    key: { position: [0, 10, 0], intensity: 1.2, color: '#ffffff' },
    fill: { position: [-4, 4, 4], intensity: 0.35, color: '#ffffff' },
    rim: { position: [4, 4, -4], intensity: 0.35, color: '#ffffff' },
  },
};

export default function StudioLighting({ preset = 'studio', shadows = true }: Props) {
  const s = PRESETS[preset];
  return (
    <>
      <ambientLight intensity={s.ambient} />
      <hemisphereLight args={[s.hemi.sky, s.hemi.ground, s.hemi.intensity]} />
      <directionalLight
        position={s.key.position}
        intensity={s.key.intensity}
        color={s.key.color}
        castShadow={shadows}
      />
      <directionalLight
        position={s.fill.position}
        intensity={s.fill.intensity}
        color={s.fill.color}
      />
      <directionalLight position={s.rim.position} intensity={s.rim.intensity} color={s.rim.color} />
    </>
  );
}
