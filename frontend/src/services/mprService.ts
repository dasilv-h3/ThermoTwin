import { apiFetch } from './api';

export type GeoZone = 'idf' | 'hors_idf';

export type IncomeBracket = 'bleu' | 'jaune' | 'violet' | 'rose';

export type Unit = 'forfait' | 'per_m2' | 'per_equipment' | 'per_kw';

export type WorkType =
  | 'heat_pump_air_water'
  | 'heat_pump_geothermal'
  | 'solar_combined_system'
  | 'solar_water_heater'
  | 'pellet_stove'
  | 'wood_stove'
  | 'wood_insert'
  | 'pvt_thermal'
  | 'thermodynamic_water_heater'
  | 'heat_network_connection'
  | 'oil_tank_removal'
  | 'energy_audit'
  | 'double_flow_vmc'
  | 'window_replacement'
  | 'roof_terrace_insulation'
  | 'roof_rampant_insulation'
  | 'solar_radiation_protection';

/**
 * Quantity descriptor for a work type. `null` means the aid is a forfait
 * (no per-unit field shown). When set, the form renders a dedicated field
 * with the exact label/unit/helper of the geste.
 */
export interface QuantitySpec {
  label: string;
  unit: string;
  helper: string;
  placeholder: string;
}

export interface WorkTypeMeta {
  key: WorkType;
  label: string;
  category: 'chauffage' | 'eau-chaude' | 'bois' | 'isolation' | 'ventilation' | 'autre';
  quantity: QuantitySpec | null;
}

const SURFACE_M2 = (place: string): QuantitySpec => ({
  label: `Surface à isoler`,
  unit: 'm²',
  helper: `Surface totale du ${place} à isoler, en mètres carrés.`,
  placeholder: 'ex : 50',
});

export const WORK_TYPES: WorkTypeMeta[] = [
  {
    key: 'heat_pump_air_water',
    label: 'Pompe à chaleur air/eau',
    category: 'chauffage',
    quantity: null,
  },
  { key: 'heat_pump_geothermal', label: 'PAC géothermique', category: 'chauffage', quantity: null },
  {
    key: 'solar_combined_system',
    label: 'Système solaire combiné',
    category: 'chauffage',
    quantity: null,
  },
  {
    key: 'pvt_thermal',
    label: 'PVT eau (partie thermique)',
    category: 'chauffage',
    quantity: null,
  },
  {
    key: 'heat_network_connection',
    label: 'Raccordement réseau de chaleur',
    category: 'chauffage',
    quantity: null,
  },
  {
    key: 'solar_water_heater',
    label: 'Chauffe-eau solaire',
    category: 'eau-chaude',
    quantity: null,
  },
  {
    key: 'thermodynamic_water_heater',
    label: 'Chauffe-eau thermodynamique',
    category: 'eau-chaude',
    quantity: null,
  },
  { key: 'pellet_stove', label: 'Poêle à granulés', category: 'bois', quantity: null },
  { key: 'wood_stove', label: 'Poêle à bûches', category: 'bois', quantity: null },
  { key: 'wood_insert', label: 'Insert à bois', category: 'bois', quantity: null },
  {
    key: 'roof_terrace_insulation',
    label: 'Isolation toiture-terrasse',
    category: 'isolation',
    quantity: SURFACE_M2('toit-terrasse'),
  },
  {
    key: 'roof_rampant_insulation',
    label: 'Isolation rampants/combles',
    category: 'isolation',
    quantity: SURFACE_M2('rampant ou des combles aménagés'),
  },
  {
    key: 'window_replacement',
    label: 'Fenêtres / parois vitrées',
    category: 'isolation',
    quantity: {
      label: 'Nombre de fenêtres à remplacer',
      unit: 'fenêtre(s)',
      helper: 'Compte chaque fenêtre, porte-fenêtre ou paroi vitrée que tu prévois de remplacer.',
      placeholder: 'ex : 5',
    },
  },
  {
    key: 'solar_radiation_protection',
    label: 'Protection rayonnement solaire (Outre-mer)',
    category: 'isolation',
    quantity: {
      label: 'Surface protégée',
      unit: 'm²',
      helper: 'Surface des parois opaques protégées du rayonnement, en m².',
      placeholder: 'ex : 30',
    },
  },
  { key: 'double_flow_vmc', label: 'VMC double-flux', category: 'ventilation', quantity: null },
  { key: 'oil_tank_removal', label: 'Dépose cuve à fioul', category: 'autre', quantity: null },
  { key: 'energy_audit', label: 'Audit énergétique', category: 'autre', quantity: null },
];

export const BRACKET_LABEL: Record<IncomeBracket, string> = {
  bleu: 'Bleu (très modeste)',
  jaune: 'Jaune (modeste)',
  violet: 'Violet (intermédiaire)',
  rose: 'Rose (supérieur)',
};

export const BRACKET_COLOR: Record<IncomeBracket, string> = {
  bleu: '#3b82f6',
  jaune: '#f59e0b',
  violet: '#a855f7',
  rose: '#ec4899',
};

export interface EligibilityRequest {
  revenu_fiscal: number;
  household_size: number;
  zone: GeoZone;
  work_type: WorkType;
  year?: number;
}

export interface EligibilityResponse {
  is_eligible: boolean;
  bracket: IncomeBracket;
  reason: string;
  work_type: WorkType;
  year: number;
}

export interface AidAmountRequest extends EligibilityRequest {
  quantity?: number;
}

export interface AidAmountResponse {
  is_eligible: boolean;
  amount: number;
  unit_amount: number | null;
  quantity_applied: number;
  bracket: IncomeBracket;
  work_type: WorkType;
  unit: Unit;
  year: number;
  reason: string;
}

export function fetchEligibility(payload: EligibilityRequest): Promise<EligibilityResponse> {
  return apiFetch<EligibilityResponse>('/api/mpr/eligibility', {
    method: 'POST',
    body: { year: 2026, ...payload },
  });
}

export function fetchAidAmount(payload: AidAmountRequest): Promise<AidAmountResponse> {
  return apiFetch<AidAmountResponse>('/api/mpr/aid-amount', {
    method: 'POST',
    body: { year: 2026, quantity: 1, ...payload },
  });
}

export function reasonMessage(reason: string, bracket: IncomeBracket, year: number): string {
  switch (reason) {
    case 'ok':
      return 'Vous êtes éligible à MaPrimeRénov’ pour ces travaux.';
    case 'bracket_not_eligible_for_this_work':
      return `Votre tranche ${BRACKET_LABEL[bracket]} n’est pas éligible à ce geste pour le barème ${year}.`;
    case 'work_type_not_in_bareme':
      return `Ce type de travaux ne figure pas au barème ${year}.`;
    case 'no_thresholds_for_year':
      return `Le barème ${year} n’est pas encore disponible.`;
    default:
      return 'Résultat indisponible.';
  }
}
