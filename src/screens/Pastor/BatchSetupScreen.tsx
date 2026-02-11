import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppContext } from '../../services/store';

const PRESETS = [
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: 'Custom', days: 0 },
];

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function BatchSetupScreen({ navigation }: any) {
  const { user } = useAppContext();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState('');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

  const getDayCount = (): number => {
    if (selectedPreset === null) return 0;
    const preset = PRESETS[selectedPreset];
    if (preset.days === 0) {
      return parseInt(customDays, 10) || 0;
    }
    return preset.days;
  };

  const dayCount = getDayCount();
  const endDate = dayCount > 0 ? addDays(startDate, dayCount - 1) : null;

  const handleContinue = () => {
    if (dayCount <= 0) {
      Alert.alert('Select Duration', 'Please choose how many days to create devotionals for.');
      return;
    }
    if (dayCount > 365) {
      Alert.alert('Too Many Days', 'Please select 365 days or fewer.');
      return;
    }

    // Generate array of date strings
    const dates: string[] = [];
    for (let i = 0; i < dayCount; i++) {
      const d = addDays(startDate, i);
      dates.push(d.toISOString().split('T')[0]);
    }

    navigation.navigate('BatchList', { dates });
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Batch Create" streakCount={user?.streakCount || 0} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>How many days?</Text>
        <Text style={styles.subheading}>
          Create devotionals for multiple days at once. You can fill them in any order.
        </Text>

        <View style={styles.presetsGrid}>
          {PRESETS.map((preset, index) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.presetCard,
                selectedPreset === index && styles.presetCardSelected,
              ]}
              onPress={() => setSelectedPreset(index)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.presetLabel,
                selectedPreset === index && styles.presetLabelSelected,
              ]}>
                {preset.label}
              </Text>
              {preset.days > 0 && (
                <Text style={[
                  styles.presetDays,
                  selectedPreset === index && styles.presetDaysSelected,
                ]}>
                  {preset.days} days
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedPreset !== null && PRESETS[selectedPreset].days === 0 && (
          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Number of days:</Text>
            <TextInput
              style={styles.customInput}
              keyboardType="number-pad"
              value={customDays}
              onChangeText={setCustomDays}
              placeholder="e.g. 45"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
          </View>
        )}

        {/* Date range preview */}
        <View style={styles.rangeCard}>
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Starting from</Text>
              <Text style={styles.rangeValue}>{formatDate(startDate)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Ending on</Text>
              <Text style={styles.rangeValue}>
                {endDate ? formatDate(endDate) : '---'}
              </Text>
            </View>
          </View>
          {dayCount > 0 && (
            <Text style={styles.rangeSummary}>
              {dayCount} devotional{dayCount !== 1 ? 's' : ''} to write
            </Text>
          )}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          size="lg"
          disabled={dayCount <= 0}
          style={styles.continueButton}
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  heading: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  presetCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  presetLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  presetLabelSelected: {
    color: colors.primary,
  },
  presetDays: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  presetDaysSelected: {
    color: colors.primaryLight,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  customLabel: {
    ...typography.body,
    color: colors.text,
  },
  customInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: 100,
    textAlign: 'center',
    ...typography.bodyBold,
    color: colors.text,
  },
  rangeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.lg,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeItem: {
    alignItems: 'center',
    flex: 1,
  },
  rangeLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  rangeValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  rangeSummary: {
    ...typography.caption,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
