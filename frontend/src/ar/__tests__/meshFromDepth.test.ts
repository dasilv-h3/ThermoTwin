import { DepthInput, meshFromDepth } from '../arcore/meshFromDepth';

function flatPlane(width: number, height: number, depth: number): DepthInput {
  return {
    depth: new Float32Array(width * height).fill(depth),
    width,
    height,
    fx: 100,
    fy: 100,
    cx: width / 2,
    cy: height / 2,
  };
}

describe('meshFromDepth', () => {
  it('produces 2 triangles per cell for a flat plane (no delta)', () => {
    const mesh = meshFromDepth(flatPlane(4, 4, 1), { step: 1, maxDepthDelta: 0.1 });
    // 4x4 → 3x3 cells = 9, 2 triangles each = 18 faces
    expect(mesh.faces).toHaveLength(18);
    expect(mesh.vertices).toHaveLength(16);
  });

  it('drops faces across depth discontinuity', () => {
    const input = flatPlane(2, 2, 1);
    input.depth[3] = 5; // créé un saut de 4m sur un coin
    const mesh = meshFromDepth(input, { step: 1, maxDepthDelta: 0.1 });
    // 1 cell, mais delta 4m > 0.1 → 0 face
    expect(mesh.faces).toHaveLength(0);
    expect(mesh.vertices).toHaveLength(4);
  });

  it('respects step parameter (sous-échantillonnage)', () => {
    const meshFine = meshFromDepth(flatPlane(8, 8, 1), { step: 1, maxDepthDelta: 0.1 });
    const meshCoarse = meshFromDepth(flatPlane(8, 8, 1), { step: 2, maxDepthDelta: 0.1 });
    expect(meshCoarse.vertices.length).toBeLessThan(meshFine.vertices.length);
    expect(meshCoarse.faces.length).toBeLessThan(meshFine.faces.length);
  });

  it('skips invalid pixels (z = 0)', () => {
    const input = flatPlane(4, 4, 0); // toute la depth invalide
    const mesh = meshFromDepth(input, { step: 1, maxDepthDelta: 0.1 });
    expect(mesh.vertices).toHaveLength(0);
    expect(mesh.faces).toHaveLength(0);
  });

  it('throws on invalid step', () => {
    expect(() => meshFromDepth(flatPlane(4, 4, 1), { step: 0 })).toThrow();
  });

  it('throws on size mismatch', () => {
    const bad: DepthInput = {
      depth: new Float32Array(10),
      width: 4,
      height: 4,
      fx: 1,
      fy: 1,
      cx: 0,
      cy: 0,
    };
    expect(() => meshFromDepth(bad)).toThrow();
  });
});
