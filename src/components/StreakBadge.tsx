import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ count, size = 'md' }: StreakBadgeProps) {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 24;
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 15 : 20;

  return (
    <View style={[styles.container, sizeStyles[size]]}>
      <Ionicons name="flame" size={iconSize} color={colors.streak} />
      <Text style={[styles.count, { fontSize }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.full,
  },
  count: {
    fontWeight: '700',
    color: colors.streak,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingHorizontal: spacing.sm, paddingVertical: 2, gap: 2 },
  md: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: 4 },
  lg: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 6 },
});
