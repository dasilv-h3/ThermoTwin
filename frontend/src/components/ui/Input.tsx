import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { palette, radius, spacing, typography } from '../../theme';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  helper?: string;
  error?: string;
};

const Input = forwardRef<TextInput, Props>(function Input(
  { label, helper, error, editable = true, ...rest },
  ref,
) {
  const hasError = Boolean(error);
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        editable={editable}
        style={[styles.input, !editable && styles.inputDisabled, hasError && styles.inputError]}
        placeholderTextColor={palette.neutral[400]}
        accessibilityLabel={label}
        accessibilityState={{ disabled: !editable }}
        {...rest}
      />
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
    color: palette.neutral[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.neutral[300],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.size.body,
    color: palette.neutral[900],
    backgroundColor: palette.neutral[0],
    minHeight: 44,
  },
  inputDisabled: {
    backgroundColor: palette.neutral[100],
    color: palette.neutral[500],
  },
  inputError: { borderColor: palette.danger[500] },
  helperText: {
    fontSize: typography.size.caption,
    color: palette.neutral[500],
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.size.caption,
    color: palette.danger[500],
    marginTop: spacing.xs,
  },
});
