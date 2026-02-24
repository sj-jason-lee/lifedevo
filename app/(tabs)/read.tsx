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
import { ReadingProgress } from '../../components/sections/ReadingProgress';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useDevotionals } from '../../hooks/useDevotionals';
import { useChurch } from '../../hooks/useChurch';
import { readingPlan } from '../../lib/readingPlanData';
import { useCompletions } from '../../lib/CompletionContext';
import type { Devotional } from '../../types';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ReadScreen() {
  const insets = useSafeAreaInsets();
  const { isComplete } = useCompletions();
  const { church, isLoading: churchLoading } = useChurch();
  const churchId = churchLoading ? undefined : church?.id ?? null;
  const { devotionals } = useDevotionals(churchId);
  const headerFade = useFadeIn(0);
  const planFade = useFadeIn(Config.animation.stagger.card);
  const readingPlanFade = useFadeIn(Config.animation.stagger.card * 2);

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
        <Animated.View style={headerFade}>
          <Text style={styles.headerLabel}>DEVOTIONALS</Text>
          <Text style={styles.headerTitle}>Read</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* All Devotionals */}
        <Animated.View style={planFade}>
          <Text style={styles.listHeading}>All Devotionals</Text>
        </Animated.View>

        {devotionals.map((devo, i) => (
          <DevotionalListCard key={devo.id} devotional={devo} index={i} completed={isComplete(devo.id)} />
        ))}

        {/* Reading Plan */}
        <Animated.View style={[styles.sectionSpacing, { marginTop: Config.spacing.sectionGap }, readingPlanFade]}>
          <Text style={styles.listHeading}>Reading Plan</Text>
          <ReadingProgress plan={readingPlan} index={1} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface DevotionalListCardProps {
  devotional: Devotional;
  index: number;
  completed: boolean;
}

const DevotionalListCard = ({ devotional, index, completed }: DevotionalListCardProps) => {
  const fadeStyle = useFadeIn(
    Config.animation.stagger.card * (index + 2)
  );
  const isToday = devotional.date === new Date().toISOString().slice(0, 10);

  return (
    <Animated.View style={[styles.cardSpacing, fadeStyle]}>
      <AnimatedPressable
        onPress={() => router.push(`/devotional/${devotional.id}`)}
      >
        <GradientCard style={styles.listCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardDate}>
                  {formatDate(devotional.date)}
                </Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>TODAY</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {devotional.title}
              </Text>
              <Text style={styles.cardScripture}>{devotional.scripture}</Text>
              <Text style={styles.cardMeta}>
                {devotional.readTimeMinutes} min &middot; {devotional.author}
              </Text>
            </View>
            <View style={styles.cardChevron}>
              {completed ? (
                <Feather
                  name="check-circle"
                  size={20}
                  color={Colors.accent}
                />
              ) : (
                <Feather
                  name="chevron-right"
                  size={20}
                  color={Colors.textMuted}
                />
              )}
            </View>
          </View>
        </GradientCard>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },

  // Header
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
    marginBottom: 8,
  },

  // Spacing
  sectionSpacing: {
    marginBottom: Config.spacing.sectionGap,
  },

  // List heading
  listHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  // List cards
  cardSpacing: {
    marginBottom: 12,
  },
  listCard: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardDate: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  todayBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textAccent,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardScripture: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  cardMeta: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  cardChevron: {
    marginLeft: 12,
  },
});
