import { useEffect, useMemo, useState } from 'react';

import { ARSession } from './ARSession';
import { getLidarCapability, LidarCapability } from './lidarCapability';
import { ARSessionConfig, ARSessionError, ARSessionStatus, ARTrackingState } from './types';

export type UseARSessionResult = {
  status: ARSessionStatus;
  tracking: ARTrackingState;
  capability: LidarCapability;
  error: ARSessionError | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export function useARSession(config?: Partial<ARSessionConfig>): UseARSessionResult {
  const [session] = useState(() => new ARSession(config));
  const capability = useMemo(() => getLidarCapability(), []);
  const [status, setStatus] = useState<ARSessionStatus>('idle');
  const [tracking, setTracking] = useState<ARTrackingState>(
    capability.supported ? 'initializing' : 'not-available',
  );
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
      } else if (event.type === 'error') {
        setError(event.error);
      }
    });

    return () => {
      off();
      session.stop().catch(() => {});
    };
  }, [session]);

  return {
    status,
    tracking,
    capability,
    error,
    start: () => session.start(),
    stop: () => session.stop(),
  };
}
