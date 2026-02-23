import { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../../components/ui/GradientCard';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useCompletions } from '../../lib/CompletionContext';
import { useReflections } from '../../lib/ReflectionContext';
import { useOnboarding } from '../../lib/OnboardingContext';
import { getDevotionalById } from '../../lib/dummyData';
import type { DevotionalAnswers } from '../../types';

// --- Helper functions ---

interface QAPair {
  questionText: string;
  answerText: string;
}

interface GroupedReflection {
  devotionalId: string;
  devotionalTitle: string;
  scripture: string;
  pairs: QAPair[];
  lastModified: string;
}

const computeStreak = (
  completedAtFn: (id: string) => string | undefined,
  completedIds: string[]
): number => {
  const dateSet = new Set<string>();
  for (const id of completedIds) {
    const ts = completedAtFn(id);
    if (ts) {
      dateSet.add(ts.slice(0, 10)); // YYYY-MM-DD
    }
  }
  if (dateSet.size === 0) return 0;

  const sorted = Array.from(dateSet).sort((a, b) => (a > b ? -1 : 1));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const curr = new Date(sorted[i] + 'T00:00:00');
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const countReflections = (
  answers: Record<string, DevotionalAnswers>
): number => {
  let count = 0;
  for (const entry of Object.values(answers)) {
    const hasAnswer = Object.values(entry.answers).some((text) => text.trim());
    if (hasAnswer) count++;
  }
  return count;
};

const collectUserReflections = (
  answers: Record<string, DevotionalAnswers>
): GroupedReflection[] => {
  const results: GroupedReflection[] = [];
  for (const entry of Object.values(answers)) {
    const devo = getDevotionalById(entry.devotionalId);
    if (!devo) continue;
    const pairs: QAPair[] = [];
    for (const [qIdx, text] of Object.entries(entry.answers)) {
      if (!text.trim()) continue;
      const questionIndex = Number(qIdx);
      pairs.push({
        questionText: devo.reflectQuestions[questionIndex] ?? '',
        answerText: text,
      });
    }
    if (pairs.length === 0) continue;
    results.push({
      devotionalId: entry.devotionalId,
      devotionalTitle: devo.title,
      scripture: devo.scripture,
      pairs,
      lastModified: entry.lastModified,
    });
  }
  results.sort((a, b) => (a.lastModified > b.lastModified ? -1 : 1));
  return results;
};

const formatDate = (isoStr: string): string => {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// --- Sub-components ---

interface ProfileReflectionCardProps {
  reflection: GroupedReflection;
  index: number;
}

const ProfileReflectionCard = ({ reflection, index }: ProfileReflectionCardProps) => {
  const fadeStyle = useFadeIn(Config.animation.stagger.card * (index + 5));

  return (
    <Animated.View style={[styles.cardSpacing, fadeStyle]}>
      <GradientCard>
        <View style={styles.reflectionHeader}>
          <Text style={styles.reflectionTitle} numberOfLines={1}>
            {reflection.devotionalTitle}
          </Text>
          <View style={styles.scripturePill}>
            <Text style={styles.scripturePillText}>{reflection.scripture}</Text>
          </View>
        </View>
        {reflection.pairs.map((pair, pairIndex) => (
          <View key={pairIndex}>
            {pairIndex > 0 && <View style={styles.pairDivider} />}
            <Text style={styles.reflectionQuestion}>
              &ldquo;{pair.questionText}&rdquo;
            </Text>
            <View style={styles.divider} />
            <Text style={styles.reflectionAnswer}>{pair.answerText}</Text>
          </View>
        ))}
      </GradientCard>
    </Animated.View>
  );
};

interface CompletionHistoryCardProps {
  devotionalId: string;
  completedDate: string;
  index: number;
}

const CompletionHistoryCard = ({ devotionalId, completedDate, index }: CompletionHistoryCardProps) => {
  const fadeStyle = useFadeIn(Config.animation.stagger.card * (index + 5));
  const devo = getDevotionalById(devotionalId);
  if (!devo) return null;

  return (
    <Animated.View style={[styles.cardSpacing, fadeStyle]}>
      <AnimatedPressable
        onPress={() => router.push(`/devotional/${devotionalId}`)}
      >
        <GradientCard>
          <View style={styles.historyRow}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyTitle} numberOfLines={1}>
                {devo.title}
              </Text>
              <Text style={styles.historyMeta}>
                {devo.scripture} · {formatDate(completedDate)}
              </Text>
            </View>
            <Feather name="check-circle" size={20} color={Colors.accent} />
          </View>
        </GradientCard>
      </AnimatedPressable>
    </Animated.View>
  );
};

// --- Main screen ---

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { completedIds, completedAt } = useCompletions();
  const { answers } = useReflections();
  const { userName, initials } = useOnboarding();

  const streak = useMemo(
    () => computeStreak(completedAt, completedIds),
    [completedIds, completedAt]
  );
  const reflectionCount = useMemo(
    () => countReflections(answers),
    [answers]
  );
  const userReflections = useMemo(
    () => collectUserReflections(answers),
    [answers]
  );

  const headerFade = useFadeIn(0);
  const avatarFade = useFadeIn(Config.animation.stagger.card);
  const statsFade = useFadeIn(Config.animation.stagger.card * 2);
  const reflectionsHeadingFade = useFadeIn(Config.animation.stagger.card * 3);
  const historyHeadingFade = useFadeIn(Config.animation.stagger.card * 4);

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
          <Text style={styles.headerLabel}>YOUR JOURNEY</Text>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Avatar + Info */}
        <Animated.View style={[styles.avatarSection, avatarFade]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.memberSince}>MEMBER SINCE FEBRUARY 2026</Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, statsFade]}>
          <GradientCard style={styles.statCard}>
            <Text style={styles.statValue}>{completedIds.length}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </GradientCard>
          <GradientCard style={styles.statCard}>
            <Text style={styles.statValue}>{reflectionCount}</Text>
            <Text style={styles.statLabel}>REFLECTIONS</Text>
          </GradientCard>
          <GradientCard style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
          </GradientCard>
        </Animated.View>

        {/* Your Reflections */}
        {userReflections.length > 0 && (
          <>
            <Animated.View style={[styles.sectionHeadingWrap, reflectionsHeadingFade]}>
              <Text style={styles.sectionHeading}>Your Reflections</Text>
            </Animated.View>
            {userReflections.map((r, i) => (
              <ProfileReflectionCard
                key={r.devotionalId}
                reflection={r}
                index={i}
              />
            ))}
          </>
        )}

        {/* Completion History */}
        {completedIds.length > 0 && (
          <>
            <Animated.View style={[styles.sectionHeadingWrap, historyHeadingFade]}>
              <Text style={styles.sectionHeading}>Completion History</Text>
            </Animated.View>
            {completedIds.map((id, i) => (
              <CompletionHistoryCard
                key={id}
                devotionalId={id}
                completedDate={completedAt(id) ?? new Date().toISOString()}
                index={i}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// --- Styles ---

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

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: Config.spacing.sectionGap,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentDim,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 24,
    color: Colors.accent,
  },
  userName: {
    fontSize: 22,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  memberSince: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Config.spacing.sectionGap,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 28,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  statLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Section heading
  sectionHeadingWrap: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },

  // Card spacing
  cardSpacing: {
    marginBottom: 12,
  },

  // Reflection cards
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  reflectionTitle: {
    fontSize: 16,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  scripturePill: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  scripturePillText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  reflectionQuestion: {
    fontSize: 17,
    lineHeight: 17 * 1.4,
    fontFamily: FontFamily.drama,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  pairDivider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  reflectionAnswer: {
    ...TypeScale.body,
    color: Colors.textPrimary,
  },

  // History cards
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyLeft: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyMeta: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
});
