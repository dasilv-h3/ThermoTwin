import { StyleSheet, View } from 'react-native';
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

import { DpeBand, DpeClass, DPE_CLASS_ORDER } from './dpeScales';

type Props = {
  bands: readonly DpeBand[];
  palette: Record<DpeClass, string>;
  // Note du logement à mettre en évidence (flèche noire à droite).
  highlight?: DpeClass;
};

const BAR_HEIGHT = 28;
const BAR_GAP = 4;
const INDICATOR_WIDTH = 44;
const INDICATOR_GAP = 6;
const MIN_BAR_WIDTH_RATIO = 0.25; // Bande A = 25% de la largeur, puis croît.

// Génère une bande "drapeau" (rectangle + pointe triangulaire à droite).
// width/height en unités SVG, retourne un Polygon de 5 points.
function bandPolygon(width: number, height: number): string {
  const tipDepth = height / 2;
  return [
    `0,0`,
    `${width},0`,
    `${width + tipDepth},${height / 2}`,
    `${width},${height}`,
    `0,${height}`,
  ].join(' ');
}

export default function DPEScale({ bands, palette, highlight }: Props) {
  const count = bands.length;
  // Largeur relative : grandit linéairement de MIN à 1.
  const widthRatios = bands.map(
    (_, i) => MIN_BAR_WIDTH_RATIO + ((1 - MIN_BAR_WIDTH_RATIO) * i) / (count - 1),
  );

  return (
    <View style={styles.container}>
      <View style={styles.barsBlock}>
        {bands.map((band, i) => (
          <View key={band.klass} style={[styles.row, { marginBottom: BAR_GAP }]}>
            <View style={[styles.barWrapper, { flex: widthRatios[i] }]}>
              <Svg height={BAR_HEIGHT} width="100%" viewBox={`0 0 ${100} ${BAR_HEIGHT}`}>
                <Polygon
                  points={bandPolygon(100 - BAR_HEIGHT / 2, BAR_HEIGHT)}
                  fill={palette[band.klass]}
                />
                <SvgText x={8} y={BAR_HEIGHT / 2 + 4} fontSize="11" fill="#1a1a1a">
                  {band.label}
                </SvgText>
                <SvgText
                  x={100 - BAR_HEIGHT / 2 - 14}
                  y={BAR_HEIGHT / 2 + 5}
                  fontSize="14"
                  fontWeight="bold"
                  fill="#1a1a1a"
                >
                  {band.klass}
                </SvgText>
              </Svg>
            </View>
            <View style={{ flex: 1 - widthRatios[i] }} />
          </View>
        ))}
      </View>

      <View style={styles.indicators}>
        {DPE_CLASS_ORDER.map((klass) => (
          <View
            key={klass}
            style={[styles.indicatorRow, { height: BAR_HEIGHT, marginBottom: BAR_GAP }]}
          >
            <Svg height={BAR_HEIGHT} width={INDICATOR_WIDTH}>
              <Polygon
                points={[
                  `8,0`,
                  `${INDICATOR_WIDTH},0`,
                  `${INDICATOR_WIDTH},${BAR_HEIGHT}`,
                  `8,${BAR_HEIGHT}`,
                  `0,${BAR_HEIGHT / 2}`,
                ].join(' ')}
                fill={highlight === klass ? '#0b1220' : '#1a1a1a'}
                stroke={highlight === klass ? '#ffd400' : 'transparent'}
                strokeWidth={highlight === klass ? 2 : 0}
              />
              <SvgText
                x={INDICATOR_WIDTH / 2 + 4}
                y={BAR_HEIGHT / 2 + 5}
                fontSize="14"
                fontWeight="bold"
                fill="#ffffff"
                textAnchor="middle"
              >
                {klass}
              </SvgText>
            </Svg>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start' },
  barsBlock: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  barWrapper: {},
  indicators: { marginLeft: INDICATOR_GAP, alignItems: 'flex-start' },
  indicatorRow: { justifyContent: 'center' },
});
