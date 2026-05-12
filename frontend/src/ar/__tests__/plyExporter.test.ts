import { exportMeshPLY } from '../export/plyExporter';
import { Mesh } from '../export/types';

const tri: Mesh = {
  vertices: [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
  ],
  faces: [[0, 1, 2]],
};

describe('exportMeshPLY', () => {
  it('emits header with magic, format and counts', () => {
    const ply = exportMeshPLY(tri);
    expect(ply.startsWith('ply\n')).toBe(true);
    expect(ply).toContain('format ascii 1.0');
    expect(ply).toContain('element vertex 3');
    expect(ply).toContain('element face 1');
    expect(ply).toContain('end_header');
  });

  it('writes faces with vertex count prefix 3 and 0-based indices', () => {
    const ply = exportMeshPLY(tri);
    expect(ply).toContain('3 0 1 2');
  });

  it('adds normal properties and values when provided', () => {
    const mesh: Mesh = {
      ...tri,
      normals: [
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: 1 },
      ],
    };
    const ply = exportMeshPLY(mesh);
    expect(ply).toContain('property float nx');
    expect(ply).toContain('property float ny');
    expect(ply).toContain('property float nz');
  });

  it('adds color properties and clamps to 0..255', () => {
    const mesh: Mesh = {
      ...tri,
      colors: [
        { r: 300, g: -10, b: 128.7 },
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ],
    };
    const ply = exportMeshPLY(mesh);
    expect(ply).toContain('property uchar red');
    expect(ply).toContain('255 0 129');
  });
});
