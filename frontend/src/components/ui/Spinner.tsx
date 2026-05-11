import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  label?: string;
  size?: 'small' | 'large';
  color?: string;
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Spinner({
  label,
  size = 'large',
  color = '#1f6feb',
  fullscreen,
  style,
}: Props) {
  return (
    <View
      style={[fullscreen ? styles.fullscreen : styles.inline, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Chargement en cours'}
    >
      <ActivityIndicator size={size} color={color} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inline: { alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    gap: 8,
  },
  label: { fontSize: 13, color: '#555', fontWeight: '500' },
});
