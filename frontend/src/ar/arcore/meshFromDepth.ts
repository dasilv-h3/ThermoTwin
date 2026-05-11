// Génère un mesh triangulé à partir d'une depth map ARCore. Méthode "grid mesh" :
// pour chaque carré de 4 pixels voisins (u,v), (u+1,v), (u,v+1), (u+1,v+1), si
// les 4 sont valides (depth > 0 et delta acceptable), on émet 2 triangles.
// Le delta-test évite les triangles aberrants à la frontière d'objets (un mur
// proche et un fond lointain ne doivent pas être reliés).
//
// ARCore ne fournit pas de mesh natif comme ARKit (ARMeshAnchor) — on doit
// reconstruire à partir de la depth map.

export type DepthInput = {
  depth: Float32Array; // mètres, 0 = invalide
  width: number;
  height: number;
  fx: number;
  fy: number;
  cx: number;
  cy: number;
};

export type Vertex3D = { x: number; y: number; z: number };
export type Triangle = readonly [number, number, number];

export type GeneratedMesh = {
  vertices: Vertex3D[];
  faces: Triangle[];
};

export type MeshGenerationOptions = {
  // Pas de la grille en pixels. Plus c'est grand, moins de triangles.
  step: number;
  // Delta max acceptable de profondeur entre 2 pixels voisins pour les
  // relier. Au-delà → on considère qu'on est sur un bord d'objet (mètres).
  maxDepthDelta: number;
};

const DEFAULT_OPTIONS: MeshGenerationOptions = {
  step: 2,
  maxDepthDelta: 0.15,
};

export function meshFromDepth(
  input: DepthInput,
  options: Partial<MeshGenerationOptions> = {},
): GeneratedMesh {
  const { step, maxDepthDelta } = { ...DEFAULT_OPTIONS, ...options };
  if (step < 1 || !Number.isFinite(step)) {
    throw new Error('step must be >= 1');
  }

  const { depth, width, height, fx, fy, cx, cy } = input;
  if (depth.length !== width * height) {
    throw new Error('depth size mismatch');
  }

  // Map pixel (u,v) → index dans vertices ; -1 si pixel invalide.
  const vertexIndex = new Int32Array(width * height).fill(-1);
  const vertices: Vertex3D[] = [];
  const faces: Triangle[] = [];

  for (let v = 0; v < height; v += step) {
    for (let u = 0; u < width; u += step) {
      const idx = v * width + u;
      const z = depth[idx];
      if (z > 0) {
        vertexIndex[idx] = vertices.length;
        vertices.push({
          x: ((u - cx) * z) / fx,
          y: ((v - cy) * z) / fy,
          z,
        });
      }
    }
  }

  for (let v = 0; v + step < height; v += step) {
    for (let u = 0; u + step < width; u += step) {
      const i00 = vertexIndex[v * width + u];
      const i10 = vertexIndex[v * width + (u + step)];
      const i01 = vertexIndex[(v + step) * width + u];
      const i11 = vertexIndex[(v + step) * width + (u + step)];
      if (i00 < 0 || i10 < 0 || i01 < 0 || i11 < 0) {
        continue;
      }
      const z00 = vertices[i00].z;
      const z10 = vertices[i10].z;
      const z01 = vertices[i01].z;
      const z11 = vertices[i11].z;
      const max = Math.max(z00, z10, z01, z11);
      const min = Math.min(z00, z10, z01, z11);
      if (max - min > maxDepthDelta) {
        continue;
      }
      faces.push([i00, i10, i11]);
      faces.push([i00, i11, i01]);
    }
  }

  return { vertices, faces };
}
