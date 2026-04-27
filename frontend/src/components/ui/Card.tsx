import { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, radius, shadow, spacing } from '../../theme';

type Props = PropsWithChildren<{
  variant?: 'flat' | 'outlined' | 'elevated';
  padding?: keyof typeof spacing;
  style?: StyleProp<ViewStyle>;
}>;

export default function Card({ variant = 'flat', padding = 'lg', children, style }: Props) {
  return (
    <View style={[styles.base, { padding: spacing[padding] }, VARIANTS[variant], style]}>
      {children}
    </View>
  );
}

const VARIANTS = {
  flat: { backgroundColor: palette.neutral[50] },
  outlined: {
    backgroundColor: palette.neutral[0],
    borderWidth: 1,
    borderColor: palette.neutral[200],
  },
  elevated: {
    backgroundColor: palette.neutral[0],
    ...shadow.md,
  },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
});
