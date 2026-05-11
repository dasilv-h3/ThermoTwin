export type ARCoreStatus = 'idle' | 'starting' | 'running' | 'paused' | 'stopped' | 'error';

export type ARCoreTrackingState = 'tracking' | 'paused' | 'stopped';

export type ARCoreDepthMode = 'disabled' | 'automatic' | 'raw';

export type ARCoreConfig = {
  depthMode: ARCoreDepthMode;
  planeFindingHorizontal: boolean;
  planeFindingVertical: boolean;
  lightEstimation: boolean;
};

export type ARCoreErrorCode =
  | 'unsupported-platform'
  | 'unsupported-version'
  | 'apk-missing'
  | 'permission-denied'
  | 'native-error';

export type ARCoreError = {
  code: ARCoreErrorCode;
  message: string;
};

export type ARCoreEvent =
  | { type: 'status'; status: ARCoreStatus }
  | { type: 'tracking'; state: ARCoreTrackingState }
  | { type: 'error'; error: ARCoreError };

export type ARCoreListener = (event: ARCoreEvent) => void;

export const DEFAULT_ARCORE_CONFIG: ARCoreConfig = {
  depthMode: 'automatic',
  planeFindingHorizontal: true,
  planeFindingVertical: true,
  lightEstimation: true,
};
