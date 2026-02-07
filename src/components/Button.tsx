import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              sizeTextStyles[size],
              variantTextStyles[variant],
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm },
  md: { paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md },
});

const sizeTextStyles = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 17 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceSecondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.primary },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
});
