import { apiFetch } from './api';

export type ScanCaptureMode = 'video' | 'video-with-lidar';
export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

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

export type ThermalStats = {
  min_celsius: number;
  max_celsius: number;
  mean_celsius: number;
};

export type HeatZone = {
  area: string;
  severity: 'low' | 'medium' | 'high';
  temperature_celsius?: number | null;
  description?: string | null;
};

export type ArtisanSnapshot = {
  id: string;
  company_name: string;
  distance_km: number;
  specialties: string[];
  certifications: string[];
  phone?: string | null;
  email?: string | null;
};

export type ScanSummary = {
  id: string;
  started_at: string;
  finalized_at: string | null;
  location_label: string | null;
  dpe_class: DpeClass | null;
  duration_ms: number | null;
};

export type ScanDetail = ScanSummary & {
  capture_mode: ScanCaptureMode;
  frame_count: number;
  credit_consumed: boolean;
  dpe_consumption: number | null;
  dpe_emissions: number | null;
  thermal_stats: ThermalStats | null;
  heat_zones: HeatZone[];
  nearby_artisans: ArtisanSnapshot[];
};

export type ScanResultsPayload = {
  location_label?: string;
  duration_ms?: number;
  dpe_consumption?: number;
  dpe_emissions?: number;
  dpe_class?: DpeClass;
  thermal_stats?: ThermalStats;
  heat_zones?: HeatZone[];
  nearby_artisans?: ArtisanSnapshot[];
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

export function attachScanResults(
  scanId: string,
  payload: ScanResultsPayload,
): Promise<ScanDetail> {
  return apiFetch<ScanDetail>(`/api/scans/${scanId}/results`, {
    method: 'PATCH',
    body: payload,
  });
}

export function fetchScanHistory(limit = 50): Promise<{ items: ScanSummary[]; total: number }> {
  return apiFetch(`/api/scans?limit=${limit}`);
}

export function fetchScanDetail(scanId: string): Promise<ScanDetail> {
  return apiFetch(`/api/scans/${scanId}`);
}
