import { ARCoreDepthMap, ARCoreDepthPoint } from './depthTypes';

// Décode un buffer DEPTH16 ARCore brut (Uint16Array) vers depth float + conf.
// Format DEPTH16 : 13 bits profondeur (mm) | 3 bits confiance [0..7].
//   depth_mm = raw & 0x1FFF
//   conf_raw = (raw >> 13) & 0x7
// Une profondeur de 0 signifie pixel invalide (objet trop proche/loin ou hors
// du cône fiable du capteur). Confidence 0 = aucune mesure fiable.
export function decodeDepth16(raw: Uint16Array): { depth: Float32Array; confidence: Float32Array } {
  const depth = new Float32Array(raw.length);
  const confidence = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const v = raw[i];
    const depthMm = v & 0x1fff;
    const confRaw = (v >> 13) & 0x7;
    depth[i] = depthMm > 0 ? depthMm / 1000 : 0;
    confidence[i] = confRaw / 7;
  }
  return { depth, confidence };
}

// Reproject une ARCoreDepthMap en nuage de points 3D dans le repère caméra.
// Identique en principe à la version iOS, mais accepte directement le type
// ARCore (un seul buffer combiné depth+confidence).
export function reprojectARCoreDepth(
  map: ARCoreDepthMap,
  stride: number = 4,
  minConfidence: number = 0.3,
): ARCoreDepthPoint[] {
  if (map.depth.length !== map.width * map.height) {
    throw new Error('depth size does not match map dimensions');
  }
  if (map.confidence.length !== map.depth.length) {
    throw new Error('depth/confidence length mismatch');
  }
  if (stride < 1 || !Number.isFinite(stride)) {
    throw new Error('stride must be >= 1');
  }

  const out: ARCoreDepthPoint[] = [];
  const { depth, confidence, width, height, fx, fy, cx, cy } = map;

  for (let v = 0; v < height; v += stride) {
    for (let u = 0; u < width; u += stride) {
      const idx = v * width + u;
      const z = depth[idx];
      const c = confidence[idx];
      if (z <= 0 || c < minConfidence) {
        continue;
      }
      out.push({
        x: ((u - cx) * z) / fx,
        y: ((v - cy) * z) / fy,
        z,
        confidence: c,
      });
    }
  }
  return out;
}

// Pont natif : appellera `Frame.acquireDepthImage()` côté ARCore puis
// extrait les buffers Image.Plane vers Uint16Array (DEPTH16) avant décode.
// Stub asynchrone pour l'instant.
export async function captureARCoreDepthMap(): Promise<ARCoreDepthMap> {
  // Stub : depth/conf vides 320x240, intrinsèques typiques d'un Pixel 7.
  const width = 320;
  const height = 240;
  return {
    depth: new Float32Array(width * height),
    confidence: new Float32Array(width * height),
    width,
    height,
    fx: 270,
    fy: 270,
    cx: 160,
    cy: 120,
    timestamp: Date.now() / 1000,
  };
}
