import { Mesh } from './types';

// Sérialise un Mesh au format Stanford PLY ASCII. Spec :
//   ply
//   format ascii 1.0
//   element vertex N
//   property float x|y|z
//   [property uchar red|green|blue]
//   element face M
//   property list uchar int vertex_indices
//   end_header
//   <data>
// Indices 0-based dans la liste de face (différent d'OBJ).
export function exportMeshPLY(mesh: Mesh): string {
  const lines: string[] = [];
  const hasColors = mesh.colors !== undefined && mesh.colors.length === mesh.vertices.length;
  const hasNormals = mesh.normals !== undefined && mesh.normals.length === mesh.vertices.length;

  lines.push('ply');
  lines.push('format ascii 1.0');
  lines.push('comment ThermoTwin scan export');
  lines.push(`element vertex ${mesh.vertices.length}`);
  lines.push('property float x');
  lines.push('property float y');
  lines.push('property float z');
  if (hasNormals) {
    lines.push('property float nx');
    lines.push('property float ny');
    lines.push('property float nz');
  }
  if (hasColors) {
    lines.push('property uchar red');
    lines.push('property uchar green');
    lines.push('property uchar blue');
  }
  lines.push(`element face ${mesh.faces.length}`);
  lines.push('property list uchar int vertex_indices');
  lines.push('end_header');

  for (let i = 0; i < mesh.vertices.length; i++) {
    const v = mesh.vertices[i];
    const parts = [fmt(v.x), fmt(v.y), fmt(v.z)];
    if (hasNormals && mesh.normals) {
      const n = mesh.normals[i];
      parts.push(fmt(n.x), fmt(n.y), fmt(n.z));
    }
    if (hasColors && mesh.colors) {
      const c = mesh.colors[i];
      parts.push(byte(c.r), byte(c.g), byte(c.b));
    }
    lines.push(parts.join(' '));
  }

  for (const [a, b, c] of mesh.faces) {
    lines.push(`3 ${a} ${b} ${c}`);
  }

  return lines.join('\n') + '\n';
}

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toFixed(6) : '0.000000';
}

function byte(n: number): string {
  const v = Math.max(0, Math.min(255, Math.round(n)));
  return String(v);
}
