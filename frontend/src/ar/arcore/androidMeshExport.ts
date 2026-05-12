import { GeneratedMesh } from './meshFromDepth';

// Sérialise un GeneratedMesh (reconstruit depuis une depth map ARCore) au
// format OBJ ASCII. Choix OBJ : universel, lisible dans Files Android, dans
// Quick Look iOS, et dans tous les viewers 3D du marché.
//
// Spec OBJ utilisée ici : commentaires `#`, sommets `v x y z`, faces
// triangulées `f a b c` avec indices 1-based.
export function exportAndroidMeshOBJ(mesh: GeneratedMesh, comment?: string): string {
  const lines: string[] = [];
  lines.push('# ThermoTwin Android scan');
  if (comment) {
    for (const line of comment.split('\n')) {
      lines.push(`# ${line}`);
    }
  }
  lines.push(`# vertices: ${mesh.vertices.length}`);
  lines.push(`# faces: ${mesh.faces.length}`);

  for (const v of mesh.vertices) {
    lines.push(`v ${fmt(v.x)} ${fmt(v.y)} ${fmt(v.z)}`);
  }

  for (const [a, b, c] of mesh.faces) {
    lines.push(`f ${a + 1} ${b + 1} ${c + 1}`);
  }

  return lines.join('\n') + '\n';
}

// Variante PLY ASCII pour outils 3D qui le préfèrent (CloudCompare, MeshLab).
export function exportAndroidMeshPLY(mesh: GeneratedMesh): string {
  const lines: string[] = [];
  lines.push('ply');
  lines.push('format ascii 1.0');
  lines.push('comment ThermoTwin Android scan');
  lines.push(`element vertex ${mesh.vertices.length}`);
  lines.push('property float x');
  lines.push('property float y');
  lines.push('property float z');
  lines.push(`element face ${mesh.faces.length}`);
  lines.push('property list uchar int vertex_indices');
  lines.push('end_header');
  for (const v of mesh.vertices) {
    lines.push(`${fmt(v.x)} ${fmt(v.y)} ${fmt(v.z)}`);
  }
  for (const [a, b, c] of mesh.faces) {
    lines.push(`3 ${a} ${b} ${c}`);
  }
  return lines.join('\n') + '\n';
}

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toFixed(6) : '0.000000';
}
