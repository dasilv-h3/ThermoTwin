import { apiFetch } from './api';

export type Specialty =
  | 'wall_insulation'
  | 'roof_insulation'
  | 'floor_insulation'
  | 'window_replacement'
  | 'heating'
  | 'heat_pump'
  | 'ventilation'
  | 'solar_panels'
  | 'other';

export interface Certification {
  name: string;
  code?: string | null;
  valid_until?: string | null;
}

export interface Artisan {
  id: string;
  company_name: string;
  siret: string;
  email: string | null;
  phone: string | null;
  about: string | null;
  specialties: Specialty[];
  certifications: Certification[];
  address: string;
  postal_code: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews_count: number;
  experience_years: number;
  projects_count: number;
  distance_km: number | null;
}

export interface ArtisanListResponse {
  items: Artisan[];
  total: number;
}

export interface ListArtisansParams {
  lat?: number;
  lng?: number;
  radius_km?: number;
  specialty?: Specialty;
  postal_code?: string;
  search?: string;
  limit?: number;
}

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function fetchArtisans(params: ListArtisansParams = {}): Promise<ArtisanListResponse> {
  return apiFetch<ArtisanListResponse>(
    `/api/artisans${buildQuery(params as Record<string, unknown>)}`,
  );
}

export function fetchArtisan(id: string): Promise<Artisan> {
  return apiFetch<Artisan>(`/api/artisans/${id}`);
}
