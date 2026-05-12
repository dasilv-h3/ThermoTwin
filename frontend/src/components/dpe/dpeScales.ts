// Échelles officielles DPE (réforme 2021) — ADEME.
// Indices A-G calculés à partir de la consommation énergétique primaire
// (kWhEP/m²·an) et des émissions de gaz à effet de serre (kgeqCO2/m²·an).
// La classe finale du logement = max(classeEnergie, classeGES).

export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export const DPE_CLASS_ORDER: readonly DpeClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export type DpeBand = {
  klass: DpeClass;
  // borne supérieure incluse ; undefined pour la dernière bande (G).
  max?: number;
  label: string;
};

// Vert (économe) → rouge (énergivore).
export const CONSUMPTION_PALETTE: Record<DpeClass, string> = {
  A: '#2c9a3a',
  B: '#68b738',
  C: '#c8d32f',
  D: '#f4d000',
  E: '#f08a1d',
  F: '#e4571b',
  G: '#d0201c',
};

// Dégradé violet (faible → forte émission).
export const EMISSIONS_PALETTE: Record<DpeClass, string> = {
  A: '#f1e3f5',
  B: '#dcc1e4',
  C: '#c19fd3',
  D: '#a87fc1',
  E: '#8e60ae',
  F: '#74429b',
  G: '#5b2789',
};

export const CONSUMPTION_BANDS: readonly DpeBand[] = [
  { klass: 'A', max: 50, label: '≤50' },
  { klass: 'B', max: 90, label: '51 à 90' },
  { klass: 'C', max: 150, label: '91 à 150' },
  { klass: 'D', max: 230, label: '151 à 230' },
  { klass: 'E', max: 330, label: '231 à 330' },
  { klass: 'F', max: 450, label: '331 à 450' },
  { klass: 'G', label: '> 450' },
];

export const EMISSIONS_BANDS: readonly DpeBand[] = [
  { klass: 'A', max: 5, label: '≤5' },
  { klass: 'B', max: 10, label: '6 à 10' },
  { klass: 'C', max: 20, label: '11 à 20' },
  { klass: 'D', max: 35, label: '21 à 35' },
  { klass: 'E', max: 55, label: '36 à 55' },
  { klass: 'F', max: 80, label: '56 à 80' },
  { klass: 'G', label: '> 80' },
];

// Détermine la classe correspondant à une valeur (kWhEP/m²·an ou kgeqCO2/m²·an).
// Retourne 'G' si la valeur dépasse la dernière borne.
export function classifyDpe(value: number, bands: readonly DpeBand[]): DpeClass {
  if (!Number.isFinite(value) || value < 0) {
    return 'A';
  }
  for (const band of bands) {
    if (band.max === undefined || value <= band.max) {
      return band.klass;
    }
  }
  return 'G';
}

// Classe finale d'un logement = la pire des deux (réforme 2021).
export function combinedDpeClass(consumption: number, emissions: number): DpeClass {
  const energyClass = classifyDpe(consumption, CONSUMPTION_BANDS);
  const gesClass = classifyDpe(emissions, EMISSIONS_BANDS);
  const energyIdx = DPE_CLASS_ORDER.indexOf(energyClass);
  const gesIdx = DPE_CLASS_ORDER.indexOf(gesClass);
  return DPE_CLASS_ORDER[Math.max(energyIdx, gesIdx)];
}
