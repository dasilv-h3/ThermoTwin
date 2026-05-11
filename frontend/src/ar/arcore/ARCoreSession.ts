import { getARCoreCapability } from './arcoreCapability';
import {
  ARCoreConfig,
  ARCoreError,
  ARCoreEvent,
  ARCoreListener,
  ARCoreStatus,
  DEFAULT_ARCORE_CONFIG,
} from './types';

export class ARCoreSession {
  private status: ARCoreStatus = 'idle';
  private listeners = new Set<ARCoreListener>();
  private readonly config: ARCoreConfig;

  constructor(config: Partial<ARCoreConfig> = {}) {
    this.config = { ...DEFAULT_ARCORE_CONFIG, ...config };
  }

  getStatus(): ARCoreStatus {
    return this.status;
  }

  getConfig(): ARCoreConfig {
    return this.config;
  }

  on(listener: ARCoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.status === 'running' || this.status === 'starting') {
      return;
    }

    const capability = getARCoreCapability();
    if (!capability.supported) {
      const error: ARCoreError = {
        code: capability.reason === 'platform' ? 'unsupported-platform' : 'unsupported-version',
        message: `ARCore non supporté (${capability.reason ?? 'unknown'})`,
      };
      this.emit({ type: 'error', error });
      throw error;
    }

    this.setStatus('starting');
    try {
      await this.initNativeSession();
      this.setStatus('running');
      this.emit({ type: 'tracking', state: 'tracking' });
    } catch (cause) {
      const error: ARCoreError = {
        code: 'native-error',
        message: cause instanceof Error ? cause.message : 'Erreur native ARCore',
      };
      this.setStatus('error');
      this.emit({ type: 'error', error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.status === 'idle' || this.status === 'stopped') {
      return;
    }
    this.setStatus('stopped');
  }

  private setStatus(status: ARCoreStatus): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.emit({ type: 'status', status });
  }

  private emit(event: ARCoreEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  // Pont natif : appelle Session.resume() côté ARCore avec la config (depth
  // mode, plane detection, light estimation). Vérifie aussi la présence de
  // l'APK Google Play Services for AR ; si absent, lance une intent
  // d'installation. Stub pour Expo Go ; remplacé par module natif en dev-build.
  private async initNativeSession(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
