import { reprojectDepthMap } from '../capture/pointCloudCapture';
import { CameraIntrinsics } from '../capture/types';

const intrinsics: CameraIntrinsics = {
  fx: 100,
  fy: 100,
  cx: 2,
  cy: 2,
  width: 4,
  height: 4,
};

function makeDepth(values: number[]): Float32Array {
  return new Float32Array(values);
}

function makeConfidence(values: number[]): Uint8Array {
  return new Uint8Array(values);
}

describe('reprojectDepthMap', () => {
  it('projects pixel at principal point to (0, 0, z)', () => {
    const depth = makeDepth(Array(16).fill(0));
    depth[2 * 4 + 2] = 1.5; // pixel (cx=2, cy=2)
    const conf = makeConfidence(Array(16).fill(2));
    const points = reprojectDepthMap(depth, conf, intrinsics, 1);
    const projected = points.find((p) => Math.abs(p.x) < 1e-6 && Math.abs(p.y) < 1e-6);
    expect(projected).toBeDefined();
    expect(projected?.z).toBeCloseTo(1.5);
  });

  it('skips pixels with z <= 0', () => {
    const depth = makeDepth(Array(16).fill(0));
    const conf = makeConfidence(Array(16).fill(2));
    expect(reprojectDepthMap(depth, conf, intrinsics, 1)).toHaveLength(0);
  });

  it('maps confidence 0/1/2 to 0/0.5/1', () => {
    const depth = makeDepth(Array(16).fill(1));
    const conf = makeConfidence([0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const points = reprojectDepthMap(depth, conf, intrinsics, 1);
    expect(points[0].confidence).toBe(0);
    expect(points[1].confidence).toBeCloseTo(0.5);
    expect(points[2].confidence).toBeCloseTo(1);
  });

  it('subsamples by stride', () => {
    const depth = makeDepth(Array(16).fill(1));
    const conf = makeConfidence(Array(16).fill(2));
    expect(reprojectDepthMap(depth, conf, intrinsics, 2)).toHaveLength(4);
    expect(reprojectDepthMap(depth, conf, intrinsics, 4)).toHaveLength(1);
  });

  it('throws on mismatched depth/confidence length', () => {
    expect(() =>
      reprojectDepthMap(new Float32Array(10), new Uint8Array(8), intrinsics, 1),
    ).toThrow();
  });

  it('throws on invalid stride', () => {
    const depth = makeDepth(Array(16).fill(1));
    const conf = makeConfidence(Array(16).fill(2));
    expect(() => reprojectDepthMap(depth, conf, intrinsics, 0)).toThrow();
  });
});
