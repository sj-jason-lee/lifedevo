import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { GradientCard } from '../../components/ui/GradientCard';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { getPlanById } from '../../lib/dummyData';
import { useReadingPlan } from '../../lib/ReadingPlanContext';
import type { ReadingPlanDay } from '../../types';

interface DayRowProps {
  planId: string;
  planDay: ReadingPlanDay;
  isCurrent: boolean;
  isDone: boolean;
  index: number;
}

const DayRow = ({ planId, planDay, isCurrent, isDone, index }: DayRowProps): JSX.Element => {
  const fadeStyle = useFadeIn(Config.animation.stagger.text * 4 + index * 60);

  return (
    <Animated.View style={fadeStyle}>
      <AnimatedPressable
        onPress={() => router.push(`/reading/${planId}/${planDay.day}`)}
      >
        <GradientCard
          style={[
            styles.dayCard,
            isCurrent && styles.dayCardCurrent,
          ]}
        >
          <View style={styles.dayCardLeft}>
            <Text style={styles.dayNumber}>DAY {planDay.day}</Text>
            <Text style={styles.dayPassage}>{planDay.passage}</Text>
          </View>
          <Feather
            name={isDone ? 'check-circle' : 'circle'}
            size={22}
            color={isDone ? Colors.accent : Colors.textMuted}
          />
        </GradientCard>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function PlanOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const plan = getPlanById(id ?? '');
  const {
    isDayComplete,
    completedCount,
    currentDay: getCurrentDay,
  } = useReadingPlan();

  const headerFade = useFadeIn(0);
  const titleFade = useFadeIn(Config.animation.stagger.text);
  const progressFade = useFadeIn(Config.animation.stagger.text * 2);
  const ctaFade = useFadeIn(Config.animation.stagger.text * 3);

  // Pulsing glow for CTA
  const glowOpacity = useSharedValue(0.3);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1500 }),
      -1,
      true
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!plan) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Plan not found</Text>
      </View>
    );
  }

  const completed = completedCount(plan.id);
  const current = getCurrentDay(plan.id, plan.totalDays);
  const progress = completed / plan.totalDays;
  const currentPassage = plan.days.find((d) => d.day === current)?.passage ?? '';

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerFade]}>
          <AnimatedPressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </AnimatedPressable>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>READING PLAN</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={titleFade}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.description}>{plan.description}</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Progress */}
        <Animated.View style={[styles.progressSection, progressFade]}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {completed} of {plan.totalDays} days complete
          </Text>
        </Animated.View>

        {/* Read Today CTA */}
        <Animated.View style={ctaFade}>
          <AnimatedPressable
            style={styles.ctaWrapper}
            onPress={() => router.push(`/reading/${plan.id}/${current}`)}
          >
            <Animated.View style={[styles.ctaGlow, glowStyle]} />
            <LinearGradient
              colors={[Colors.accent, '#B8972F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <View style={styles.ctaContent}>
                <Text style={styles.ctaLabel}>READ TODAY</Text>
                <Text style={styles.ctaPassage}>{currentPassage}</Text>
              </View>
              <Feather name="arrow-right" size={20} color={Colors.textDark} />
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        {/* Day List */}
        <View style={styles.dayListSection}>
          <Text style={styles.dayListLabel}>ALL DAYS</Text>
          {plan.days.map((planDay, index) => (
            <DayRow
              key={planDay.day}
              planId={plan.id}
              planDay={planDay}
              isCurrent={planDay.day === current}
              isDone={isDayComplete(plan.id, planDay.day)}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },
  errorText: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  headerBadgeText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },

  // Title
  planName: {
    fontSize: 38,
    lineHeight: 38 * 1.05,
    fontFamily: FontFamily.dramaBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    ...TypeScale.body,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginBottom: 28,
  },

  // Progress
  progressSection: {
    marginBottom: 28,
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

  // CTA
  ctaWrapper: {
    marginBottom: 36,
    borderRadius: Config.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  ctaGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: Config.radius.md + 4,
    backgroundColor: Colors.accentGlow,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: Config.radius.md,
  },
  ctaContent: {
    flex: 1,
  },
  ctaLabel: {
    ...TypeScale.mono,
    color: Colors.textDark,
    marginBottom: 4,
  },
  ctaPassage: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textDark,
  },

  // Day list
  dayListSection: {
    gap: 10,
  },
  dayListLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 6,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dayCardCurrent: {
    borderColor: Colors.borderAccent,
    backgroundColor: Colors.accentSoft,
  },
  dayCardLeft: {
    flex: 1,
    gap: 2,
  },
  dayNumber: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  dayPassage: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.textPrimary,
  },
});
