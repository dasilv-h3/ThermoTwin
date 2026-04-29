import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  visible: boolean;
  label?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  onComplete?: () => void;
};

export default function SuccessCheck({
  visible,
  label,
  size = 80,
  color = '#2f9e44',
  style,
  onComplete,
}: Props) {
  const [scale] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      scale.setValue(0);
      opacity.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onComplete?.();
    });
  }, [visible, scale, opacity, onComplete]);

  if (!visible) return null;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={[styles.tick, { fontSize: size * 0.55 }]}>✓</Text>
      </Animated.View>
      {label ? <Animated.Text style={[styles.label, { opacity }]}>{label}</Animated.Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12 },
  badge: { alignItems: 'center', justifyContent: 'center' },
  tick: { color: '#fff', fontWeight: '800' },
  label: { fontSize: 16, fontWeight: '700', color: '#111' },
});
