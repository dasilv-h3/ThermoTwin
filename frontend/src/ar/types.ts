export type ARTrackingState = 'not-available' | 'initializing' | 'limited' | 'normal' | 'failed';

export type ARSessionStatus = 'idle' | 'starting' | 'running' | 'paused' | 'stopped' | 'error';

export type ARSceneReconstruction = 'none' | 'mesh' | 'mesh-with-classification';

export type ARFrameSemantics = 'none' | 'scene-depth' | 'smoothed-scene-depth';

// Vidéo = mode socle, toujours disponible. LiDAR vient enrichir la vidéo
// quand le device le supporte (depth map + reconstruction mesh).
export type ARCaptureMode = 'video' | 'video-with-lidar';

// Mode demandé par l'appelant. 'auto' = LiDAR si dispo sinon vidéo seule.
export type ARCaptureModePreference = 'auto' | 'video' | 'video-with-lidar';

export type ARSessionConfig = {
  modePreference: ARCaptureModePreference;
  worldAlignment: 'gravity' | 'gravity-and-heading' | 'camera';
  planeDetection: ('horizontal' | 'vertical')[];
  sceneReconstruction: ARSceneReconstruction;
  frameSemantics: ARFrameSemantics;
  lightEstimationEnabled: boolean;
};

export type ARSessionError = {
  code: 'permission-denied' | 'unsupported-platform' | 'native-error';
  message: string;
};

export type ARSessionEvent =
  | { type: 'status'; status: ARSessionStatus }
  | { type: 'tracking'; state: ARTrackingState }
  | { type: 'mode'; mode: ARCaptureMode }
  | { type: 'error'; error: ARSessionError };

export type ARSessionListener = (event: ARSessionEvent) => void;

export const DEFAULT_AR_CONFIG: ARSessionConfig = {
  modePreference: 'auto',
  worldAlignment: 'gravity',
  planeDetection: ['horizontal', 'vertical'],
  sceneReconstruction: 'mesh-with-classification',
  frameSemantics: 'smoothed-scene-depth',
  lightEstimationEnabled: true,
};
