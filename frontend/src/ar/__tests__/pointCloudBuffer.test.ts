import { PointCloudBuffer } from '../capture/pointCloudBuffer';
import { PointCloudFrame } from '../capture/types';

function frame(timestamp: number, points: number, confidence = 1): PointCloudFrame {
  return {
    timestamp,
    points: Array.from({ length: points }, () => ({ x: 0, y: 0, z: 1, confidence })),
    intrinsics: { fx: 1, fy: 1, cx: 0, cy: 0, width: 1, height: 1 },
    cameraTransform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  };
}

describe('PointCloudBuffer', () => {
  it('accumulates frames and counts points', () => {
    const buf = new PointCloudBuffer();
    buf.add(frame(1, 10));
    buf.add(frame(2, 20));
    expect(buf.getStats().frameCount).toBe(2);
    expect(buf.getStats().pointCount).toBe(30);
  });

  it('reports duration between first and last frame timestamps', () => {
    const buf = new PointCloudBuffer();
    buf.add(frame(10, 5));
    buf.add(frame(12, 5));
    expect(buf.getStats().durationMs).toBe(2000);
  });

  it('computes average confidence across all points', () => {
    const buf = new PointCloudBuffer();
    buf.add(frame(1, 10, 0.5));
    buf.add(frame(2, 10, 1));
    expect(buf.getStats().averageConfidence).toBeCloseTo(0.75, 5);
  });

  it('evicts oldest frames once max points exceeded (FIFO)', () => {
    const buf = new PointCloudBuffer(100);
    buf.add(frame(1, 60));
    buf.add(frame(2, 60));
    // 120 > 100 → première frame doit avoir été évincée
    expect(buf.getStats().frameCount).toBe(1);
    expect(buf.getStats().pointCount).toBe(60);
    expect(buf.getFrames()[0].timestamp).toBe(2);
  });

  it('clear resets everything', () => {
    const buf = new PointCloudBuffer();
    buf.add(frame(1, 10));
    buf.clear();
    expect(buf.getStats().frameCount).toBe(0);
    expect(buf.getStats().pointCount).toBe(0);
    expect(buf.getStats().durationMs).toBe(0);
  });

  it('flattenPoints returns all points in order', () => {
    const buf = new PointCloudBuffer();
    buf.add(frame(1, 3));
    buf.add(frame(2, 2));
    expect(buf.flattenPoints()).toHaveLength(5);
  });
});
