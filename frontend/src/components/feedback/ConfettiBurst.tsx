import { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

type Props = {
  active: boolean;
  count?: number;
  duration?: number;
  origin?: { x: number; y: number };
  palette?: string[];
  onComplete?: () => void;
};

const DEFAULT_PALETTE = ['#1f6feb', '#2f9e44', '#f5c518', '#d0201c', '#9b59b6'];

type Piece = {
  color: string;
  translateX: Animated.Value;
  translateY: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  size: number;
  angle: number;
  distance: number;
};

function createPieces(count: number, palette: string[]): Piece[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 160;
    return {
      color: palette[Math.floor(Math.random() * palette.length)],
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      size: 6 + Math.random() * 6,
      angle,
      distance,
    };
  });
}

export default function ConfettiBurst({
  active,
  count = 24,
  duration = 900,
  origin = { x: 0, y: 0 },
  palette = DEFAULT_PALETTE,
  onComplete,
}: Props) {
  const pieces = useMemo(
    () => (active ? createPieces(count, palette) : []),
    [active, count, palette],
  );

  useEffect(() => {
    if (!active || pieces.length === 0) return;
    const anims = pieces.map((p) =>
      Animated.parallel([
        Animated.timing(p.translateX, {
          toValue: Math.cos(p.angle) * p.distance,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(p.translateY, {
          toValue: Math.sin(p.angle) * p.distance + 40,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          delay: duration * 0.5,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ]),
    );
    Animated.stagger(10, anims).start(({ finished }) => {
      if (finished) onComplete?.();
    });
  }, [active, pieces, duration, onComplete]);

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      left: origin.x,
      top: origin.y,
      pointerEvents: 'none',
    }),
    [origin.x, origin.y],
  );

  if (!active) return null;

  return (
    <View style={containerStyle} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.piece,
            {
              width: p.size,
              height: p.size * 0.4,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.translateX },
                { translateY: p.translateY },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '540deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', borderRadius: 1 },
});
