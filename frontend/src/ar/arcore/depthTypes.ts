// ARCore Depth API expose une depth image au format ImageFormat.DEPTH16 :
// 16 bits par pixel, profondeur en millimètres + 3 bits de confiance.
// Format JS : profondeur en mètres (float) + confiance normalisée [0..1].
export type ARCoreDepthMap = {
  // Profondeur en mètres par pixel (Float32Array de width*height).
  depth: Float32Array;
  // Confiance par pixel [0..1] (Float32Array de width*height).
  confidence: Float32Array;
  width: number;
  height: number;
  // Intrinsèques caméra au moment du frame, pour reprojection 3D.
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  timestamp: number;
};

export type ARCoreDepthPoint = {
  x: number;
  y: number;
  z: number;
  confidence: number;
};
