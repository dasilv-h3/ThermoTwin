// Représentation d'un nuage de points capté depuis l'ARSession iOS (LiDAR)
// ou Android (depth API). Un point en mètres dans le repère de la caméra au
// moment du frame, avec confiance ARKit `[0=low, 1=med, 2=high]` (mappée
// sur 0–1 côté JS).
export type Point3D = {
  x: number;
  y: number;
  z: number;
  confidence: number;
};

// Intrinsèques caméra utilisées pour reprojeter une depth map en 3D.
// Coordonnées en pixels du frame capté.
export type CameraIntrinsics = {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
};

export type PointCloudFrame = {
  // Timestamp natif du frame ARKit/ARCore (secondes depuis le démarrage de la session).
  timestamp: number;
  points: Point3D[];
  intrinsics: CameraIntrinsics;
  // Matrice 4x4 row-major caméra → monde, pour fusionner plusieurs frames.
  cameraTransform: number[];
};

export type PointCloudStats = {
  frameCount: number;
  pointCount: number;
  averageConfidence: number;
  durationMs: number;
};
