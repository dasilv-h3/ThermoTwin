import { Mesh } from './types';

// Sérialise un Mesh au format Wavefront OBJ (ASCII). Spec :
//   v x y z           sommet
//   vn x y z          normale (optionnel)
//   f v1 v2 v3        face triangulée, indices 1-based
//   f v1//vn1 ...     face avec normales
// OBJ ne porte pas les couleurs sommet → ignorées.
export function exportMeshOBJ(mesh: Mesh): string {
  const lines: string[] = [];
  lines.push('# ThermoTwin scan export');
  lines.push(`# vertices: ${mesh.vertices.length}`);
  lines.push(`# faces: ${mesh.faces.length}`);

  for (const v of mesh.vertices) {
    lines.push(`v ${fmt(v.x)} ${fmt(v.y)} ${fmt(v.z)}`);
  }

  const hasNormals = mesh.normals !== undefined && mesh.normals.length === mesh.vertices.length;
  if (hasNormals && mesh.normals) {
    for (const n of mesh.normals) {
      lines.push(`vn ${fmt(n.x)} ${fmt(n.y)} ${fmt(n.z)}`);
    }
  }

  for (const [a, b, c] of mesh.faces) {
    if (hasNormals) {
      lines.push(`f ${a + 1}//${a + 1} ${b + 1}//${b + 1} ${c + 1}//${c + 1}`);
    } else {
      lines.push(`f ${a + 1} ${b + 1} ${c + 1}`);
    }
  }

  return lines.join('\n') + '\n';
}

function fmt(n: number): string {
  // 6 chiffres significatifs : suffisant pour des distances au cm près sur
  // des scans de quelques mètres, sans gonfler la taille de fichier.
  return Number.isFinite(n) ? n.toFixed(6) : '0.000000';
}
