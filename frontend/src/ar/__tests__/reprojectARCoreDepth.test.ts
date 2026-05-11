import { reprojectARCoreDepth } from '../arcore/depthCapture';
import { ARCoreDepthMap } from '../arcore/depthTypes';

function makeMap(depth: number[], confidence: number[]): ARCoreDepthMap {
  return {
    depth: new Float32Array(depth),
    confidence: new Float32Array(confidence),
    width: 4,
    height: 4,
    fx: 100,
    fy: 100,
    cx: 2,
    cy: 2,
    timestamp: 0,
  };
}

describe('reprojectARCoreDepth', () => {
  it('filters out points below minConfidence', () => {
    const map = makeMap(Array(16).fill(1), Array(16).fill(0.1));
    expect(reprojectARCoreDepth(map, 1, 0.3)).toHaveLength(0);
  });

  it('keeps points with confidence above threshold', () => {
    const map = makeMap(Array(16).fill(1), Array(16).fill(0.5));
    expect(reprojectARCoreDepth(map, 1, 0.3).length).toBeGreaterThan(0);
  });

  it('skips invalid depth = 0', () => {
    const map = makeMap(Array(16).fill(0), Array(16).fill(1));
    expect(reprojectARCoreDepth(map, 1, 0)).toHaveLength(0);
  });

  it('projects pixel at principal point to (0, 0, z)', () => {
    const depth = Array(16).fill(0);
    depth[2 * 4 + 2] = 2;
    const map = makeMap(depth, Array(16).fill(1));
    const pts = reprojectARCoreDepth(map, 1, 0);
    const center = pts.find((p) => Math.abs(p.x) < 1e-6 && Math.abs(p.y) < 1e-6);
    expect(center?.z).toBeCloseTo(2);
  });

  it('throws on size mismatch', () => {
    const bad: ARCoreDepthMap = {
      depth: new Float32Array(10),
      confidence: new Float32Array(10),
      width: 4,
      height: 4,
      fx: 1,
      fy: 1,
      cx: 0,
      cy: 0,
      timestamp: 0,
    };
    expect(() => reprojectARCoreDepth(bad)).toThrow();
  });
});
