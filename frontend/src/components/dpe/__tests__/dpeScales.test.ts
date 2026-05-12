import { CONSUMPTION_BANDS, EMISSIONS_BANDS, classifyDpe, combinedDpeClass } from '../dpeScales';

describe('classifyDpe (consumption kWhEP/m²·an)', () => {
  it('classes A for ≤ 50', () => {
    expect(classifyDpe(0, CONSUMPTION_BANDS)).toBe('A');
    expect(classifyDpe(50, CONSUMPTION_BANDS)).toBe('A');
  });

  it('classes B for 51–90', () => {
    expect(classifyDpe(51, CONSUMPTION_BANDS)).toBe('B');
    expect(classifyDpe(90, CONSUMPTION_BANDS)).toBe('B');
  });

  it('classes C/D/E/F at their upper bounds', () => {
    expect(classifyDpe(150, CONSUMPTION_BANDS)).toBe('C');
    expect(classifyDpe(230, CONSUMPTION_BANDS)).toBe('D');
    expect(classifyDpe(330, CONSUMPTION_BANDS)).toBe('E');
    expect(classifyDpe(450, CONSUMPTION_BANDS)).toBe('F');
  });

  it('classes G above 450', () => {
    expect(classifyDpe(451, CONSUMPTION_BANDS)).toBe('G');
    expect(classifyDpe(9999, CONSUMPTION_BANDS)).toBe('G');
  });

  it('returns A for invalid / negative values', () => {
    expect(classifyDpe(NaN, CONSUMPTION_BANDS)).toBe('A');
    expect(classifyDpe(-10, CONSUMPTION_BANDS)).toBe('A');
  });
});

describe('classifyDpe (emissions kgeqCO2/m²·an)', () => {
  it('classes A for ≤ 5', () => {
    expect(classifyDpe(5, EMISSIONS_BANDS)).toBe('A');
  });

  it('classes G above 80', () => {
    expect(classifyDpe(81, EMISSIONS_BANDS)).toBe('G');
  });

  it('classes intermediate buckets', () => {
    expect(classifyDpe(10, EMISSIONS_BANDS)).toBe('B');
    expect(classifyDpe(20, EMISSIONS_BANDS)).toBe('C');
    expect(classifyDpe(35, EMISSIONS_BANDS)).toBe('D');
    expect(classifyDpe(55, EMISSIONS_BANDS)).toBe('E');
    expect(classifyDpe(80, EMISSIONS_BANDS)).toBe('F');
  });
});

describe('combinedDpeClass (réforme DPE 2021)', () => {
  it('returns the worst of energy/GES classes', () => {
    // energy C (100 kWhEP) + GES E (50 kgCO2) → E
    expect(combinedDpeClass(100, 50)).toBe('E');
    // energy F (400) + GES B (8) → F
    expect(combinedDpeClass(400, 8)).toBe('F');
    // energy A (40) + GES A (3) → A
    expect(combinedDpeClass(40, 3)).toBe('A');
  });
});
