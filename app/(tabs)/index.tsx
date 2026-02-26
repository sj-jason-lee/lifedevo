import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { TypeScale, FontFamily } from '../../constants/typography';
import { Config } from '../../constants/config';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { HeroDevotional } from '../../components/sections/HeroDevotional';
import { ReadingProgress } from '../../components/sections/ReadingProgress';
import { RecentDevotionals } from '../../components/sections/RecentDevotionals';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { GradientCard } from '../../components/ui/GradientCard';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useCompletions } from '../../lib/CompletionContext';
import { useDevotionals } from '../../hooks/useDevotionals';
import { useChurch } from '../../hooks/useChurch';
import { useReadingPlan } from '../../lib/ReadingPlanContext';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isComplete, completedIds } = useCompletions();
  const { church, isLoading: churchLoading } = useChurch();
  const { userPlans } = useReadingPlan();
  const churchId = churchLoading ? undefined : church?.id ?? null;
  const { todayDevotional, recentDevotionals, isLoading } = useDevotionals(churchId);
  const headerFade = useFadeIn(0);

  const showNoChurch = !churchLoading && !church;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NoiseOverlay />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerFade]}>
          <Text style={styles.date}>{getFormattedDate()}</Text>
          <Text style={styles.greeting} accessibilityRole="header">{getGreeting()}</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {showNoChurch ? (
          /* No-church empty state */
          <View style={styles.emptyState}>
            <Feather name="home" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Join a Church</Text>
            <Text style={styles.emptyBody}>
              Devotionals are shared within your church community. Join or create a church to get started.
            </Text>
            <AnimatedPressable onPress={() => router.push('/church')}>
              <GradientCard style={styles.emptyCta}>
                <Feather name="plus" size={18} color={Colors.textAccent} />
                <Text style={styles.emptyCtaText}>Join a Church</Text>
              </GradientCard>
            </AnimatedPressable>
          </View>
        ) : (
          <>
            {/* Hero Devotional */}
            {todayDevotional && (
              <HeroDevotional devotional={todayDevotional} index={1} completed={isComplete(todayDevotional.id)} />
            )}

            {/* Recent Devotionals */}
            {recentDevotionals.length > 0 && (
              <View style={styles.section}>
                <RecentDevotionals devotionals={recentDevotionals} index={2} completedIds={completedIds} />
              </View>
            )}

            {/* Reading Plans */}
            {userPlans.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeadingRow}>
                  <Feather name="map" size={18} color={Colors.textAccent} />
                  <Text style={styles.sectionHeading}>Your Reading Plans</Text>
                </View>
              </View>
            )}
            {userPlans.map((plan, i) => (
              <View key={plan.id} style={userPlans.length > 0 ? styles.planCardSpacing : styles.section}>
                <ReadingProgress plan={plan} index={3 + i} />
              </View>
            ))}
            <View style={styles.section}>
              <AnimatedPressable onPress={() => router.push('/plans')}>
                <GradientCard style={styles.planCta}>
                  <Feather name="map" size={20} color={Colors.textAccent} />
                  <Text style={styles.planCtaText}>Browse Reading Plans</Text>
                  <Feather name="chevron-right" size={18} color={Colors.textMuted} />
                </GradientCard>
              </AnimatedPressable>
            </View>
          </>
        )}
      </Animated.ScrollView>
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
    paddingTop: 16,
  },
  header: {
    marginBottom: Config.spacing.sectionGap,
  },
  date: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  accentLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  section: {
    marginTop: Config.spacing.sectionGap,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  planCardSpacing: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  emptyBody: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyCtaText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textAccent,
  },
  planCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  planCtaText: {
    flex: 1,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textAccent,
  },
});
