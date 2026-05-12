import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { getAccessToken } from './api';

export type ReportThermalStats = {
  min_celsius: number;
  max_celsius: number;
  mean_celsius: number;
};

export type ReportHeatZone = {
  area: string;
  severity: 'low' | 'medium' | 'high';
  description?: string | null;
  temperature_celsius?: number | null;
};

export type ReportArtisan = {
  company_name: string;
  distance_km: number;
  specialties?: string[];
  certifications?: string[];
  phone?: string | null;
  email?: string | null;
};

export type ReportRecommendation = {
  title: string;
  cost?: number;
  savings?: number;
  roi?: number;
};

export type ScanReportPayload = {
  location_label?: string;
  scan_date?: string;
  dpe_class?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  dpe_consumption?: number;
  dpe_emissions?: number;
  thermal_score?: number;
  thermal_stats?: ReportThermalStats;
  overall_assessment?: string;
  heat_zones?: ReportHeatZone[];
  recommendations?: ReportRecommendation[];
  artisans?: ReportArtisan[];
  estimated_annual_savings?: number;
};

function resolveBaseURL(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8001`;
  }
  return 'http://localhost:8001';
}

/**
 * Génère le PDF côté backend, l'enregistre dans le cache documentaire local,
 * et déclenche le selecteur de partage natif (iOS share sheet / Android share intent).
 *
 * On utilise `apiFetch` ne convient pas ici (il parse en JSON) — fetch direct + base64.
 */
export async function generateAndShareScanReport(
  payload: ScanReportPayload,
): Promise<{ uri: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentification requise');

  const response = await fetch(`${resolveBaseURL()}/api/reports/scan-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/pdf',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Génération PDF échouée (${response.status})`);
  }

  // React Native fetch ne supporte pas `.blob()` partout ; on passe par base64
  // via FileSystem.downloadAsync n'est pas applicable (POST). Solution :
  // arrayBuffer → base64 puis writeAsStringAsync.
  const arrayBuffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);

  const filename = (payload.location_label ?? 'thermotwin-scan').replace(/[^a-z0-9_-]+/gi, '_');
  const uri = `${FileSystem.cacheDirectory}${filename}.pdf`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      dialogTitle: 'Partager le rapport ThermoTwin',
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  }
  return { uri };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  // React Native polyfill `global.btoa` ; fallback Buffer si manquant.
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}
