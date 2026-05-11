import { getLidarCapability } from './lidarCapability';
import {
  ARSessionConfig,
  ARSessionError,
  ARSessionEvent,
  ARSessionListener,
  ARSessionStatus,
  DEFAULT_LIDAR_CONFIG,
} from './types';

export class ARSession {
  private status: ARSessionStatus = 'idle';
  private listeners = new Set<ARSessionListener>();
  private readonly config: ARSessionConfig;

  constructor(config: Partial<ARSessionConfig> = {}) {
    this.config = { ...DEFAULT_LIDAR_CONFIG, ...config };
  }

  getStatus(): ARSessionStatus {
    return this.status;
  }

  getConfig(): ARSessionConfig {
    return this.config;
  }

  on(listener: ARSessionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.status === 'running' || this.status === 'starting') {
      return;
    }

    const capability = getLidarCapability();
    if (!capability.supported) {
      const error: ARSessionError = {
        code: capability.reason === 'platform' ? 'unsupported-platform' : 'no-lidar',
        message:
          capability.reason === 'platform'
            ? "LiDAR n'est disponible que sur iOS"
            : `Capteur LiDAR indisponible (model: ${capability.deviceModel ?? 'inconnu'})`,
      };
      this.setStatus('error');
      this.emit({ type: 'error', error });
      throw error;
    }

    this.setStatus('starting');

    try {
      await this.initNativeSession();
      this.setStatus('running');
      this.emit({ type: 'tracking', state: 'initializing' });
    } catch (cause) {
      const error: ARSessionError = {
        code: 'native-error',
        message: cause instanceof Error ? cause.message : 'Erreur native ARKit',
      };
      this.setStatus('error');
      this.emit({ type: 'error', error });
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (this.status !== 'running') {
      return;
    }
    this.setStatus('paused');
  }

  async stop(): Promise<void> {
    if (this.status === 'idle' || this.status === 'stopped') {
      return;
    }
    this.setStatus('stopped');
    this.listeners.clear();
  }

  private setStatus(status: ARSessionStatus): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.emit({ type: 'status', status });
  }

  private emit(event: ARSessionEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  // Hook natif ARWorldTrackingConfiguration. Sera branché par GPTT-25 via
  // un module Expo natif. Pour l'instant on simule un init asynchrone afin
  // que la machine à états reste exerçable côté JS/tests.
  private async initNativeSession(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
