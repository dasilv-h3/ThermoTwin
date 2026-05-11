import { exportMeshOBJ } from './objExporter';
import { exportMeshPLY } from './plyExporter';
import { ExportFormat, Mesh } from './types';

export { exportMeshOBJ } from './objExporter';
export { exportMeshPLY } from './plyExporter';
export type { ExportFormat, Face, Mesh, Vertex, VertexColor } from './types';

export function exportMesh(mesh: Mesh, format: ExportFormat): string {
  return format === 'obj' ? exportMeshOBJ(mesh) : exportMeshPLY(mesh);
}

export function suggestedFilename(baseName: string, format: ExportFormat): string {
  const safe = baseName.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'scan';
  return `${safe}.${format}`;
}
