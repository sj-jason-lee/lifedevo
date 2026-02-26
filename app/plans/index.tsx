import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../../components/ui/GradientCard';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useReadingPlan } from '../../lib/ReadingPlanContext';
import type { ReadingPlan } from '../../types';

interface PlanCardProps {
  plan: ReadingPlan;
  following: boolean;
  completed: number;
  currentDay: number;
  index: number;
  onFollow: () => void;
  onUnfollow: () => void;
}

const PlanCard = ({
  plan,
  following,
  completed,
  currentDay,
  index,
  onFollow,
  onUnfollow,
}: PlanCardProps): JSX.Element => {
  const fadeStyle = useFadeIn(Config.animation.stagger.card * (index + 2));
  const progress = completed / plan.totalDays;

  return (
    <Animated.View style={[styles.cardSpacing, fadeStyle]}>
      <AnimatedPressable onPress={() => router.push(`/plan/${plan.id}`)}>
        <GradientCard>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <Text style={styles.planDays}>{plan.totalDays} DAYS</Text>

          {following ? (
            <View style={styles.followingSection}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.followingRow}>
                <Text style={styles.progressLabel}>
                  Day {currentDay} of {plan.totalDays}
                </Text>
                <View style={styles.followingBadge}>
                  <Text style={styles.followingBadgeText}>FOLLOWING</Text>
                </View>
              </View>
              <AnimatedPressable
                style={styles.unfollowButton}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onUnfollow();
                }}
              >
                <Text style={styles.unfollowText}>Unfollow</Text>
              </AnimatedPressable>
            </View>
          ) : (
            <AnimatedPressable
              style={styles.startButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onFollow();
              }}
            >
              <Feather name="plus" size={16} color={Colors.textAccent} />
              <Text style={styles.startButtonText}>Start Plan</Text>
            </AnimatedPressable>
          )}
        </GradientCard>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function BrowsePlansScreen() {
  const insets = useSafeAreaInsets();
  const {
    allPlans,
    isFollowing,
    followPlan,
    unfollowPlan,
    completedCount,
    currentDay,
  } = useReadingPlan();
  const headerFade = useFadeIn(0);
  const subtitleFade = useFadeIn(Config.animation.stagger.text);

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
        </Animated.View>

        <Animated.View style={subtitleFade}>
          <Text style={styles.headerLabel}>BROWSE</Text>
          <Text style={styles.headerTitle}>Reading Plans</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Plan Cards */}
        {allPlans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            following={isFollowing(plan.id)}
            completed={completedCount(plan.id)}
            currentDay={currentDay(plan.id, plan.totalDays)}
            index={i}
            onFollow={() => followPlan(plan.id)}
            onUnfollow={() => unfollowPlan(plan.id)}
          />
        ))}
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
  header: {
    marginBottom: 24,
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
  headerLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginBottom: 28,
  },

  // Plan cards
  cardSpacing: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  planDescription: {
    ...TypeScale.body,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  planDays: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 16,
  },

  // Following state
  followingSection: {
    gap: 10,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  followingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...TypeScale.mono,
    color: Colors.textSecondary,
  },
  followingBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  followingBadgeText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  unfollowButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unfollowText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Start button
  startButton: {
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
  startButtonText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textAccent,
  },
});
