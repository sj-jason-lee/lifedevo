import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

interface AppHeaderProps {
  subtitle: string;
  streakCount: number;
  churchName?: string;
}

export function AppHeader({ subtitle, streakCount, churchName = 'Grace Community Church' }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.churchName}>{churchName.toUpperCase()}</Text>
          <Text style={styles.title}>Life Devo</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.streakContainer}>
          <View style={styles.streakCircle}>
            <Ionicons name="time-outline" size={22} color={colors.secondary} />
          </View>
          <Text style={styles.streakCount}>{streakCount}</Text>
          <Text style={styles.streakLabel}>DAYS</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.headerBrown,
    paddingBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  left: {
    flex: 1,
  },
  churchName: {
    ...typography.sectionLabel,
    color: colors.headerText,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 1,
  },
  subtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
});
