import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
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
import { useReadingPlan } from '../../lib/ReadingPlanContext';
import { useCompletions } from '../../lib/CompletionContext';
import type { Devotional } from '../../types';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface DevotionalListCardProps {
  devotional: Devotional;
  index: number;
  completed: boolean;
}

const DevotionalListCard = React.memo(({ devotional, index, completed }: DevotionalListCardProps) => {
  const fadeStyle = useFadeIn(
    Config.animation.stagger.card * (index + 2)
  );
  const isToday = devotional.date === new Date().toISOString().slice(0, 10);

  return (
    <Animated.View style={[styles.cardSpacing, fadeStyle]}>
      <AnimatedPressable
        onPress={() => router.push(`/devotional/${devotional.id}`)}
        accessibilityLabel={`${devotional.title}, ${devotional.scripture}${completed ? ', completed' : ''}`}
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
});

export default function ReadScreen() {
  const insets = useSafeAreaInsets();
  const { isComplete } = useCompletions();
  const { church, isLoading: churchLoading } = useChurch();
  const { userPlans } = useReadingPlan();
  const churchId = churchLoading ? undefined : church?.id ?? null;
  const { devotionals } = useDevotionals(churchId);
  const headerFade = useFadeIn(0);
  const planFade = useFadeIn(Config.animation.stagger.card);
  const readingPlanFade = useFadeIn(Config.animation.stagger.card * 2);

  const renderItem = useCallback(({ item, index }: { item: Devotional; index: number }) => (
    <DevotionalListCard devotional={item} index={index} completed={isComplete(item.id)} />
  ), [isComplete]);

  const keyExtractor = useCallback((item: Devotional) => item.id, []);

  const ListHeader = useMemo(() => (
    <>
      {/* Header */}
      <Animated.View style={headerFade}>
        <Text style={styles.headerLabel} accessibilityRole="header">LIBRARY</Text>
        <Text style={styles.headerTitle} accessibilityRole="header">Read</Text>
        <View style={styles.accentLine} />
      </Animated.View>

      {/* All Devotionals */}
      <Animated.View style={planFade}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="heart" size={18} color={Colors.textAccent} />
          <Text style={styles.listHeading}>Devotionals</Text>
        </View>
      </Animated.View>
    </>
  ), [headerFade, planFade]);

  const ListFooter = useMemo(() => (
    <>
      {/* Divider */}
      <View style={styles.sectionDivider} />

      {/* Reading Plans */}
      <Animated.View style={[styles.sectionSpacing, readingPlanFade]}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="map" size={18} color={Colors.textAccent} />
          <Text style={styles.listHeading}>Reading Plans</Text>
        </View>
        {userPlans.map((plan, i) => (
          <View key={plan.id} style={i > 0 ? styles.planSpacing : undefined}>
            <ReadingProgress plan={plan} index={i + 1} />
          </View>
        ))}
        <View style={userPlans.length > 0 ? styles.planSpacing : undefined}>
          <AnimatedPressable onPress={() => router.push('/plans')}>
            <GradientCard style={styles.exploreCta}>
              <Feather name="map" size={20} color={Colors.textAccent} />
              <Text style={styles.exploreCtaText}>Explore Reading Plans</Text>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </GradientCard>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </>
  ), [readingPlanFade, userPlans]);

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <FlatList
        data={devotionals}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        initialNumToRender={10}
        windowSize={5}
      />
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

  // Section headings
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  listHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Config.spacing.sectionGap,
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
  planSpacing: {
    marginTop: 16,
  },
  exploreCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  exploreCtaText: {
    flex: 1,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textAccent,
  },
});
