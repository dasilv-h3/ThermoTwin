import { exportMeshOBJ } from '../export/objExporter';
import { Mesh } from '../export/types';

const cube: Mesh = {
  vertices: [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 1, y: 1, z: 0 },
  ],
  faces: [[0, 1, 2]],
};

describe('exportMeshOBJ', () => {
  it('writes vertices as v x y z (6 decimals)', () => {
    const obj = exportMeshOBJ(cube);
    expect(obj).toContain('v 0.000000 0.000000 0.000000');
    expect(obj).toContain('v 1.000000 0.000000 0.000000');
  });

  it('writes faces with 1-based indices', () => {
    const obj = exportMeshOBJ(cube);
    expect(obj).toContain('f 1 2 3');
  });

  it('includes header with counts', () => {
    const obj = exportMeshOBJ(cube);
    expect(obj).toContain('# vertices: 3');
    expect(obj).toContain('# faces: 1');
  });

  it('emits vn lines and v//vn face syntax when normals provided', () => {
    const mesh: Mesh = {
      ...cube,
      normals: [
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: 1 },
      ],
    };
    const obj = exportMeshOBJ(mesh);
    expect(obj).toContain('vn 0.000000 0.000000 1.000000');
    expect(obj).toContain('f 1//1 2//2 3//3');
  });

  it('ignores normals if count mismatches vertices', () => {
    const mesh: Mesh = { ...cube, normals: [{ x: 0, y: 0, z: 1 }] };
    const obj = exportMeshOBJ(mesh);
    expect(obj).not.toContain('vn ');
    expect(obj).toContain('f 1 2 3');
  });

  it('handles non-finite coordinates by writing 0.000000', () => {
    const mesh: Mesh = {
      vertices: [{ x: NaN, y: Infinity, z: 0 }],
      faces: [],
    };
    expect(exportMeshOBJ(mesh)).toContain('v 0.000000 0.000000 0.000000');
  });
});
