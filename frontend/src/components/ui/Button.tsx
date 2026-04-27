import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { palette, radius, spacing, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'style'> &
  PropsWithChildren<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
  }>;

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  children,
  style,
  ...pressable
}: Props) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...pressable}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyle.container,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.label.color} />
      ) : (
        <View style={styles.content}>
          {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
          <Text style={[sizeStyle.label, variantStyle.label]}>{children}</Text>
          {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const SIZE_STYLES = {
  sm: {
    container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    label: { fontSize: typography.size.small, fontWeight: typography.weight.semibold },
  },
  md: {
    container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    label: { fontSize: typography.size.body, fontWeight: typography.weight.semibold },
  },
  lg: {
    container: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    label: { fontSize: typography.size.subtitle, fontWeight: typography.weight.bold },
  },
} as const;

const VARIANT_STYLES = {
  primary: {
    container: { backgroundColor: palette.brand[500] },
    label: { color: palette.neutral[0] },
  },
  secondary: {
    container: {
      backgroundColor: palette.neutral[0],
      borderWidth: 1,
      borderColor: palette.neutral[300],
    },
    label: { color: palette.neutral[800] },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: palette.brand[500] },
  },
  danger: {
    container: { backgroundColor: palette.danger[500] },
    label: { color: palette.neutral[0] },
  },
} as const;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    minHeight: 44,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { alignItems: 'center', justifyContent: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
