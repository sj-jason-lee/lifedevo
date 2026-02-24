import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../../components/ui/GradientCard';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { ReflectionCard } from '../../components/sections/ReflectionCard';
import { useReflections } from '../../lib/ReflectionContext';
import { useChurch } from '../../hooks/useChurch';
import type { SharedReflection } from '../../types';

export default function ReflectScreen() {
  const insets = useSafeAreaInsets();
  const { communityFeed, isLoading } = useReflections();
  const { church, memberCount, isLoading: churchLoading } = useChurch();
  const hasChurch = !churchLoading && !!church;

  const grouped = useMemo(() => {
    const map = new Map<string, SharedReflection[]>();
    for (const r of communityFeed) {
      const key = `${r.devotionalId}-${r.userId}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.values())
      .map(group => group.sort((a, b) => a.questionIndex - b.questionIndex))
      .sort((a, b) => new Date(b[0].sharedAt).getTime() - new Date(a[0].sharedAt).getTime());
  }, [communityFeed]);

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
        <Text style={styles.monoLabel}>{hasChurch ? 'YOUR CHURCH' : 'COMMUNITY'}</Text>
        <Text style={styles.heading}>Reflect</Text>
        <View style={styles.accentLine} />

        {/* Church card */}
        {churchLoading ? null : church ? (
          <AnimatedPressable
            onPress={() => router.push('/church')}
            style={styles.churchCard}
          >
            <GradientCard style={styles.churchCardInner}>
              <View style={styles.churchCardRow}>
                <View style={styles.churchCardLeft}>
                  <Text style={styles.churchCardName}>{church.name}</Text>
                  <Text style={styles.churchCardMeta}>
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.textMuted} />
              </View>
            </GradientCard>
          </AnimatedPressable>
        ) : (
          <AnimatedPressable
            onPress={() => router.push('/church')}
            style={styles.churchCard}
          >
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                Join or create a church to see community reflections.
              </Text>
              <View style={styles.bannerAction}>
                <Text style={styles.bannerActionText}>Get Started</Text>
                <Feather name="arrow-right" size={14} color={Colors.accent} />
              </View>
            </View>
          </AnimatedPressable>
        )}

        {/* Prompt banner */}
        {hasChurch && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              See how your church community is reflecting on this week's devotionals.
              Share your own reflections from any devotional to encourage others.
            </Text>
          </View>
        )}

        {/* Feed */}
        {isLoading ? (
          <Text style={styles.loadingText}>Loading reflections...</Text>
        ) : grouped.length === 0 ? (
          <Text style={styles.emptyText}>
            No reflections yet. Be the first to share!
          </Text>
        ) : (
          grouped.map((reflections, i) => (
            <ReflectionCard
              key={`${reflections[0].devotionalId}-${reflections[0].userId}`}
              reflections={reflections}
              index={i}
            />
          ))
        )}
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
  monoLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  heading: {
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
    marginBottom: 24,
  },
  churchCard: {
    marginBottom: 16,
  },
  churchCardInner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  churchCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchCardLeft: {
    flex: 1,
  },
  churchCardName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 17,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  churchCardMeta: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  banner: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    padding: Config.spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  bannerText: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  bannerActionText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
    color: Colors.accent,
  },
  loadingText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
