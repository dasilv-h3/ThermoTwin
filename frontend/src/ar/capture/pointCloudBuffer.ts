import { Point3D, PointCloudFrame, PointCloudStats } from './types';

// Limite par défaut : 500k points = ~12 MB en mémoire (24 bytes/point).
// Au-delà, on commence à drop les frames les plus anciennes (FIFO) pour
// éviter de saturer Hermes sur un device milieu de gamme.
const DEFAULT_MAX_POINTS = 500_000;

export class PointCloudBuffer {
  private frames: PointCloudFrame[] = [];
  private totalPoints = 0;
  private readonly maxPoints: number;
  private startedAt: number | null = null;
  private lastFrameAt: number | null = null;

  constructor(maxPoints: number = DEFAULT_MAX_POINTS) {
    this.maxPoints = maxPoints;
  }

  add(frame: PointCloudFrame): void {
    if (this.startedAt === null) {
      this.startedAt = frame.timestamp;
    }
    this.lastFrameAt = frame.timestamp;
    this.frames.push(frame);
    this.totalPoints += frame.points.length;
    this.evictIfNeeded();
  }

  clear(): void {
    this.frames = [];
    this.totalPoints = 0;
    this.startedAt = null;
    this.lastFrameAt = null;
  }

  getFrames(): readonly PointCloudFrame[] {
    return this.frames;
  }

  flattenPoints(): Point3D[] {
    const out: Point3D[] = new Array(this.totalPoints);
    let i = 0;
    for (const frame of this.frames) {
      for (const point of frame.points) {
        out[i++] = point;
      }
    }
    return out;
  }

  getStats(): PointCloudStats {
    let confidenceSum = 0;
    for (const frame of this.frames) {
      for (const point of frame.points) {
        confidenceSum += point.confidence;
      }
    }
    const avg = this.totalPoints === 0 ? 0 : confidenceSum / this.totalPoints;
    const duration =
      this.startedAt === null || this.lastFrameAt === null
        ? 0
        : Math.max(0, (this.lastFrameAt - this.startedAt) * 1000);
    return {
      frameCount: this.frames.length,
      pointCount: this.totalPoints,
      averageConfidence: avg,
      durationMs: duration,
    };
  }

  private evictIfNeeded(): void {
    while (this.totalPoints > this.maxPoints && this.frames.length > 1) {
      const dropped = this.frames.shift();
      if (dropped) {
        this.totalPoints -= dropped.points.length;
      }
    }
  }
}
