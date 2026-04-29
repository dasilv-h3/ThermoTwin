/**
 * WCAG 2.1 contrast ratio helpers.
 *
 * AA requires 4.5:1 for normal text and 3:1 for large text (18pt+ / 14pt bold).
 * AAA requires 7:1 for normal text and 4.5:1 for large text.
 */

export type WcagLevel = 'AA' | 'AAA';
export type WcagSize = 'normal' | 'large';

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lFg = relativeLuminance(hexToRgb(foregroundHex));
  const lBg = relativeLuminance(hexToRgb(backgroundHex));
  const lighter = Math.max(lFg, lBg);
  const darker = Math.min(lFg, lBg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWcag(
  foregroundHex: string,
  backgroundHex: string,
  level: WcagLevel = 'AA',
  size: WcagSize = 'normal',
): boolean {
  const ratio = contrastRatio(foregroundHex, backgroundHex);
  const thresholds: Record<WcagLevel, Record<WcagSize, number>> = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };
  return ratio >= thresholds[level][size];
}
