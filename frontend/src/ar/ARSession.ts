import { getLidarCapability } from './lidarCapability';
import {
  ARCaptureMode,
  ARSessionConfig,
  ARSessionError,
  ARSessionEvent,
  ARSessionListener,
  ARSessionStatus,
  DEFAULT_AR_CONFIG,
} from './types';

export class ARSession {
  private status: ARSessionStatus = 'idle';
  private mode: ARCaptureMode | null = null;
  private listeners = new Set<ARSessionListener>();
  private readonly config: ARSessionConfig;

  constructor(config: Partial<ARSessionConfig> = {}) {
    this.config = { ...DEFAULT_AR_CONFIG, ...config };
  }

  getStatus(): ARSessionStatus {
    return this.status;
  }

  getMode(): ARCaptureMode | null {
    return this.mode;
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

    const mode = this.resolveMode();
    this.setStatus('starting');
    this.setMode(mode);

    try {
      await this.initNativeSession(mode);
      this.setStatus('running');
      this.emit({ type: 'tracking', state: 'initializing' });
    } catch (cause) {
      const error: ARSessionError = {
        code: 'native-error',
        message: cause instanceof Error ? cause.message : 'Erreur native capture',
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

  // Vidéo = mode socle. LiDAR vient en surcouche quand le device le supporte
  // ou que l'appelant l'a explicitement demandé. Si demandé mais indisponible,
  // on log et on retombe en vidéo plutôt que d'échouer — l'utilisateur doit
  // pouvoir scanner même sans capteur.
  private resolveMode(): ARCaptureMode {
    if (this.config.modePreference === 'video') {
      return 'video';
    }
    const lidar = getLidarCapability();
    if (this.config.modePreference === 'video-with-lidar' && !lidar.supported) {
      return 'video';
    }
    return lidar.supported ? 'video-with-lidar' : 'video';
  }

  private setStatus(status: ARSessionStatus): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.emit({ type: 'status', status });
  }

  private setMode(mode: ARCaptureMode): void {
    if (this.mode === mode) {
      return;
    }
    this.mode = mode;
    this.emit({ type: 'mode', mode });
  }

  private emit(event: ARSessionEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  // Pont natif : ARWorldTrackingConfiguration en mode LiDAR (iOS Pro), ou
  // capture vidéo simple sinon. Stub asynchrone pour l'instant, branché par
  // GPTT-25 (point cloud) et GPTT-31 (depth ARCore).
  private async initNativeSession(mode: ARCaptureMode): Promise<void> {
    void mode;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
