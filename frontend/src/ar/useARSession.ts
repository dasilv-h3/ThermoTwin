import { useCallback, useEffect, useMemo, useState } from 'react';

import { ARSession } from './ARSession';
import { getLidarCapability, LidarCapability } from './lidarCapability';
import {
  ARCaptureMode,
  ARSessionConfig,
  ARSessionError,
  ARSessionStatus,
  ARTrackingState,
} from './types';

export type UseARSessionResult = {
  status: ARSessionStatus;
  tracking: ARTrackingState;
  mode: ARCaptureMode | null;
  capability: LidarCapability;
  error: ARSessionError | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export function useARSession(config?: Partial<ARSessionConfig>): UseARSessionResult {
  const [session] = useState(() => new ARSession(config));
  const capability = useMemo(() => getLidarCapability(), []);
  const [status, setStatus] = useState<ARSessionStatus>('idle');
  const [tracking, setTracking] = useState<ARTrackingState>('initializing');
  const [mode, setMode] = useState<ARCaptureMode | null>(null);
  const [error, setError] = useState<ARSessionError | null>(null);

  useEffect(() => {
    const off = session.on((event) => {
      if (event.type === 'status') {
        setStatus(event.status);
        if (event.status !== 'error') {
          setError(null);
        }
      } else if (event.type === 'tracking') {
        setTracking(event.state);
      } else if (event.type === 'mode') {
        setMode(event.mode);
      } else if (event.type === 'error') {
        setError(event.error);
      }
    });

    return () => {
      off();
      session.stop().catch(() => {});
    };
  }, [session]);

  // Refs stables : sinon chaque render recrée start/stop, et tout useEffect
  // consommateur qui dépend de stop relance son cleanup → stoppe la session
  // juste après le démarrage.
  const start = useCallback(() => session.start(), [session]);
  const stop = useCallback(() => session.stop(), [session]);

  return {
    status,
    tracking,
    mode,
    capability,
    error,
    start,
    stop,
  };
}
