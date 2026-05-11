import { decodeDepth16 } from '../arcore/depthCapture';

function pack(depthMm: number, confidence: number): number {
  return ((confidence & 0x7) << 13) | (depthMm & 0x1fff);
}

describe('decodeDepth16', () => {
  it('extracts 13-bit depth (mm) into float meters', () => {
    const raw = new Uint16Array([pack(1500, 7), pack(250, 4)]);
    const { depth } = decodeDepth16(raw);
    expect(depth[0]).toBeCloseTo(1.5);
    expect(depth[1]).toBeCloseTo(0.25);
  });

  it('extracts 3-bit confidence and normalizes to [0..1]', () => {
    const raw = new Uint16Array([pack(1000, 0), pack(1000, 7), pack(1000, 3)]);
    const { confidence } = decodeDepth16(raw);
    expect(confidence[0]).toBe(0);
    expect(confidence[1]).toBe(1);
    expect(confidence[2]).toBeCloseTo(3 / 7);
  });

  it('reports depth = 0 for invalid pixels (depth_mm = 0)', () => {
    const raw = new Uint16Array([pack(0, 5)]);
    const { depth } = decodeDepth16(raw);
    expect(depth[0]).toBe(0);
  });

  it('returns float buffers of same length as input', () => {
    const raw = new Uint16Array(100);
    const { depth, confidence } = decodeDepth16(raw);
    expect(depth.length).toBe(100);
    expect(confidence.length).toBe(100);
  });
});
