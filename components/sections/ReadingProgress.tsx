import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { TypeScale, FontFamily } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../ui/GradientCard';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useReadingPlan } from '../../lib/ReadingPlanContext';
import type { ReadingPlan } from '../../types';

interface ReadingProgressProps {
  plan: ReadingPlan;
  index: number;
}

export const ReadingProgress = ({ plan, index }: ReadingProgressProps): JSX.Element => {
  const fadeStyle = useFadeIn(index * Config.animation.stagger.card);
  const { completedCount, currentDay } = useReadingPlan();
  const completed = completedCount(plan.id);
  const current = currentDay(plan.id, plan.totalDays);
  const progress = completed / plan.totalDays;

  return (
    <Animated.View style={fadeStyle}>
      <GradientCard>
        <View style={styles.labelRow}>
          <Feather name="map" size={12} color={Colors.textAccent} />
          <Text style={styles.label}>READING PLAN</Text>
        </View>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.description}>{plan.description}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            Day {current} of {plan.totalDays} — {completed} complete
          </Text>
        </View>

        <AnimatedPressable
          style={styles.continueButton}
          onPress={() => router.push(`/plan/${plan.id}`)}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Text style={styles.arrow}>→</Text>
        </AnimatedPressable>
      </GradientCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  label: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  planName: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    ...TypeScale.caption,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressLabel: {
    ...TypeScale.mono,
    color: Colors.textSecondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    gap: 8,
  },
  continueText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textAccent,
  },
  arrow: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textAccent,
  },
});
