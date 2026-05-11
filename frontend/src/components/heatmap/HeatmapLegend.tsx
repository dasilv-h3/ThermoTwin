import { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Stop = { t: number; color: string };

type Props = {
  /** Temperature range in °C */
  minTemp: number;
  maxTemp: number;
  /** Optional colour stops; default is a thermal gradient cold→hot */
  stops?: Stop[];
  /** Height of the gradient bar */
  height?: number;
  /** Called when the user drags along the legend */
  onProbe?: (value: { temp: number; color: string; percent: number }) => void;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_STOPS: Stop[] = [
  { t: 0.0, color: '#1f3c88' },
  { t: 0.2, color: '#3b7dd8' },
  { t: 0.4, color: '#4cd4c2' },
  { t: 0.6, color: '#f5c518' },
  { t: 0.8, color: '#f08a1d' },
  { t: 1.0, color: '#d0201c' },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((c) =>
        Math.round(Math.max(0, Math.min(255, c)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function colorAt(t: number, stops: Stop[] = DEFAULT_STOPS): string {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    if (clamped <= b.t) {
      const local = (clamped - a.t) / (b.t - a.t);
      const [ar, ag, ab] = hexToRgb(a.color);
      const [br, bg, bb] = hexToRgb(b.color);
      return rgbToHex(lerp(ar, br, local), lerp(ag, bg, local), lerp(ab, bb, local));
    }
  }
  return stops[stops.length - 1].color;
}

export default function HeatmapLegend({
  minTemp,
  maxTemp,
  stops = DEFAULT_STOPS,
  height = 32,
  onProbe,
  style,
}: Props) {
  const [width, setWidth] = useState(0);
  const [probeX, setProbeX] = useState<number | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gs) => {
          updateProbe(gs.x0);
        },
        onPanResponderMove: (_, gs) => {
          updateProbe(gs.moveX);
        },
        onPanResponderRelease: () => {
          setProbeX(null);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, minTemp, maxTemp, stops, onProbe],
  );

  function updateProbe(pageX: number) {
    if (width <= 0) return;
    const clampedX = Math.max(0, Math.min(width, pageX));
    setProbeX(clampedX);
    const percent = clampedX / width;
    onProbe?.({
      temp: lerp(minTemp, maxTemp, percent),
      color: colorAt(percent, stops),
      percent,
    });
  }

  const midStops = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const t = i / 23;
      return colorAt(t, stops);
    });
  }, [stops]);

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <View
        {...responder.panHandlers}
        style={[styles.track, { height }]}
        accessibilityRole="adjustable"
        accessibilityLabel={`Légende température de ${minTemp}°C à ${maxTemp}°C`}
      >
        {midStops.map((color, i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: color, width: `${100 / midStops.length}%` }]}
          />
        ))}
        {probeX !== null ? <View style={[styles.probe, { left: probeX - 1, height }]} /> : null}
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>{Math.round(minTemp)}°C</Text>
        <Text style={styles.label}>{Math.round((minTemp + maxTemp) / 2)}°C</Text>
        <Text style={styles.label}>{Math.round(maxTemp)}°C</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 6 },
  track: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  segment: { height: '100%' },
  probe: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, color: '#555', fontWeight: '500' },
});
