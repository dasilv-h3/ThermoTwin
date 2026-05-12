import { apiFetch } from './api';

export type ScanCaptureMode = 'video' | 'video-with-lidar';

export type ScanSessionStart = {
  scan_id: string;
  started_at: string;
};

export type ScanSessionFinalize = {
  scan_id: string;
  finalized_at: string;
  credit_consumed: boolean;
  reason: 'ok' | 'no-frames' | 'already-finalized' | 'quota-exceeded';
  scans_used: number;
  scans_limit: number;
};

export function startScanSession(captureMode: ScanCaptureMode): Promise<ScanSessionStart> {
  return apiFetch<ScanSessionStart>('/api/scans/start', {
    method: 'POST',
    body: { capture_mode: captureMode },
  });
}

export function finalizeScanSession(
  scanId: string,
  frameCount: number,
): Promise<ScanSessionFinalize> {
  return apiFetch<ScanSessionFinalize>(`/api/scans/${scanId}/finalize`, {
    method: 'POST',
    body: { frame_count: frameCount },
  });
}
