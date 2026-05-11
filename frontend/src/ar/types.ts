export type ARTrackingState = 'not-available' | 'initializing' | 'limited' | 'normal' | 'failed';

export type ARSessionStatus = 'idle' | 'starting' | 'running' | 'paused' | 'stopped' | 'error';

export type ARSceneReconstruction = 'none' | 'mesh' | 'mesh-with-classification';

export type ARFrameSemantics = 'none' | 'scene-depth' | 'smoothed-scene-depth';

export type ARSessionConfig = {
  worldAlignment: 'gravity' | 'gravity-and-heading' | 'camera';
  planeDetection: ('horizontal' | 'vertical')[];
  sceneReconstruction: ARSceneReconstruction;
  frameSemantics: ARFrameSemantics;
  lightEstimationEnabled: boolean;
};

export type ARSessionError = {
  code: 'no-lidar' | 'permission-denied' | 'unsupported-platform' | 'native-error';
  message: string;
};

export type ARSessionEvent =
  | { type: 'status'; status: ARSessionStatus }
  | { type: 'tracking'; state: ARTrackingState }
  | { type: 'error'; error: ARSessionError };

export type ARSessionListener = (event: ARSessionEvent) => void;

export const DEFAULT_LIDAR_CONFIG: ARSessionConfig = {
  worldAlignment: 'gravity',
  planeDetection: ['horizontal', 'vertical'],
  sceneReconstruction: 'mesh-with-classification',
  frameSemantics: 'smoothed-scene-depth',
  lightEstimationEnabled: true,
};
