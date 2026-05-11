import { CameraIntrinsics, Point3D, PointCloudFrame } from './types';

// Reproject une depth map (profondeur en mètres par pixel) + une confiance
// en nuage de points 3D dans le repère caméra. Pour chaque pixel valide :
//   X = (u - cx) * z / fx
//   Y = (v - cy) * z / fy
//   Z = z
// On sous-échantillonne par 'stride' pour rester sous la limite de débit
// JS (un frame ARKit fournit ~256×192 = 49k points/frame, à 30 Hz c'est trop).
export function reprojectDepthMap(
  depth: Float32Array,
  confidence: Uint8Array,
  intrinsics: CameraIntrinsics,
  stride: number = 4,
): Point3D[] {
  if (depth.length !== confidence.length) {
    throw new Error('depth/confidence length mismatch');
  }
  if (depth.length !== intrinsics.width * intrinsics.height) {
    throw new Error('depth size does not match intrinsics');
  }
  if (stride < 1 || !Number.isFinite(stride)) {
    throw new Error('stride must be >= 1');
  }

  const { fx, fy, cx, cy, width, height } = intrinsics;
  const out: Point3D[] = [];

  for (let v = 0; v < height; v += stride) {
    for (let u = 0; u < width; u += stride) {
      const idx = v * width + u;
      const z = depth[idx];
      if (!Number.isFinite(z) || z <= 0) {
        continue;
      }
      out.push({
        x: ((u - cx) * z) / fx,
        y: ((v - cy) * z) / fy,
        z,
        confidence: confidence[idx] / 2, // ARKit 0/1/2 → 0/0.5/1
      });
    }
  }

  return out;
}

// Pont natif : sur iOS LiDAR, sous-jacent appelle `ARFrame.sceneDepth`
// (smoothed scene depth + confidence map) et passe les buffers à
// reprojectDepthMap. Stub asynchrone pour l'instant — le bridge sera ajouté
// quand le module natif Expo dev-build remplacera Expo Go.
export async function captureNativeFrame(): Promise<PointCloudFrame> {
  // Stub : génère un frame minimal pour permettre aux consommateurs
  // (UI progression, buffer, exporter) d'être branchés et testés.
  const intrinsics: CameraIntrinsics = {
    fx: 1500,
    fy: 1500,
    cx: 960,
    cy: 540,
    width: 1920,
    height: 1080,
  };
  return {
    timestamp: Date.now() / 1000,
    points: [],
    intrinsics,
    cameraTransform: identityMatrix4(),
  };
}

function identityMatrix4(): number[] {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
