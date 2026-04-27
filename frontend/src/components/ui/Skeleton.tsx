import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: Props) {
  const [pulse] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityLabel="Chargement"
      style={[styles.base, { width, height, borderRadius, opacity: pulse }, style]}
    />
  );
}

export function SkeletonRows({
  rows = 3,
  rowHeight = 16,
  gap = 8,
}: {
  rows?: number;
  rowHeight?: number;
  gap?: number;
}) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={rowHeight} width={i === rows - 1 ? '70%' : '100%'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#e4e7eb' },
});
