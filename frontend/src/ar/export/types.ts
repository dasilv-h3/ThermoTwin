export type Vertex = {
  x: number;
  y: number;
  z: number;
};

export type VertexColor = {
  r: number; // 0–255
  g: number;
  b: number;
};

// Face triangulée : 3 indices dans le tableau vertices (0-based côté JS).
// Les formats OBJ/PLY repassent en 1-based / 0-based selon leur convention.
export type Face = readonly [number, number, number];

export type Mesh = {
  vertices: Vertex[];
  faces: Face[];
  // Normales par sommet (optionnel). Si absent, OBJ/PLY n'écriront pas la section.
  normals?: Vertex[];
  // Couleurs par sommet (optionnel). PLY supporte nativement, OBJ ne supporte
  // pas → ignoré pour OBJ.
  colors?: VertexColor[];
};

export type ExportFormat = 'obj' | 'ply';
