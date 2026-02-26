import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { ReflectionInput } from '../../components/sections/ReflectionInput';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useDevotional } from '../../hooks/useDevotional';
import { useCompletions } from '../../lib/CompletionContext';
import { useReflections } from '../../lib/ReflectionContext';
import { useOnboarding } from '../../lib/OnboardingContext';
import { useChurch } from '../../hooks/useChurch';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DevotionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { devotional, isLoading: devotionalLoading, error: devotionalError, refetch } = useDevotional(id);
  const { isComplete: checkComplete, toggleComplete } = useCompletions();
  const { shareToggledAnswers } = useReflections();
  const { userName, initials, churchCode } = useOnboarding();
  const { church } = useChurch();
  const isComplete = devotional ? checkComplete(devotional.id) : false;

  const handleComplete = () => {
    if (!devotional) return;
    const wasComplete = isComplete;
    toggleComplete(devotional.id);
    // Share answers only when marking complete for the first time
    if (!wasComplete) {
      shareToggledAnswers(devotional.id, {
        title: devotional.title,
        scripture: devotional.scripture,
        questions: devotional.reflectQuestions,
        authorName: userName || 'You',
        authorInitials: initials || 'ME',
        churchCode: church?.inviteCode ?? churchCode,
      });
    }
  };

  const headerFade = useFadeIn(0);
  const titleFade = useFadeIn(Config.animation.stagger.text);
  const scriptureFade = useFadeIn(Config.animation.stagger.text * 2);
  const bodyFade = useFadeIn(Config.animation.stagger.text * 3);
  const reflectFade = useFadeIn(Config.animation.stagger.text * 4);
  const prayerFade = useFadeIn(Config.animation.stagger.text * 5);
  const footerFade = useFadeIn(Config.animation.stagger.text * 6);

  if (devotionalLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (devotionalError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <NoiseOverlay />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={40} color={Colors.textMuted} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>{devotionalError}</Text>
          <AnimatedPressable style={styles.retryButton} onPress={refetch}>
            <Feather name="refresh-cw" size={16} color={Colors.textAccent} />
            <Text style={styles.retryText}>Retry</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  if (!devotional) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Devotional not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Header — Back button, date, read time */}
        <Animated.View style={[styles.header, headerFade]}>
          <AnimatedPressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </AnimatedPressable>
          <View style={styles.headerMeta}>
            <Text style={styles.headerDate}>{formatDate(devotional.date)}</Text>
            <View style={styles.readTimeBadge}>
              <Text style={styles.readTimeBadgeText}>
                {devotional.readTimeMinutes} MIN READ
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={titleFade}>
          <Text style={styles.title}>{devotional.title}</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Scripture */}
        <Animated.View style={[styles.section, scriptureFade]}>
          <Text style={styles.sectionLabel}>SCRIPTURE</Text>
          <Text style={styles.scriptureRef}>{devotional.scripture}</Text>
          <Text style={styles.scriptureText}>
            &ldquo;{devotional.scriptureText}&rdquo;
          </Text>
        </Animated.View>

        {/* Devotional body */}
        <Animated.View style={[styles.section, bodyFade]}>
          <Text style={styles.sectionLabel}>DEVOTIONAL</Text>
          <Text style={styles.bodyText}>{devotional.body}</Text>
        </Animated.View>

        {/* Reflect */}
        <Animated.View style={[styles.section, reflectFade]}>
          <Text style={styles.sectionLabel}>REFLECT</Text>
          {devotional.reflectQuestions.map((question, i) => (
            <ReflectionInput
              key={i}
              devotionalId={devotional.id}
              questionIndex={i}
              questionText={question}
            />
          ))}
        </Animated.View>

        {/* Pray */}
        <Animated.View style={[styles.section, prayerFade]}>
          <Text style={styles.sectionLabel}>PRAY</Text>
          <Text style={styles.prayerText}>{devotional.prayer}</Text>
        </Animated.View>

        {/* Author footer + Complete button */}
        <Animated.View style={[styles.footer, footerFade]}>
          <Text style={styles.authorText}>
            Written by {devotional.author}
          </Text>

          <AnimatedPressable
            style={[
              styles.completeButton,
              isComplete && styles.completeButtonActive,
            ]}
            onPress={handleComplete}
          >
            {isComplete ? (
              <LinearGradient
                colors={[Colors.accent, '#B8972F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeButtonGradient}
              >
                <Feather name="check" size={18} color={Colors.textDark} />
                <Text style={styles.completeTextActive}>Completed</Text>
              </LinearGradient>
            ) : (
              <View style={styles.completeButtonInner}>
                <Feather name="circle" size={18} color={Colors.textAccent} />
                <Text style={styles.completeText}>Mark as Complete</Text>
              </View>
            )}
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 100,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 100,
    gap: 12,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  errorBody: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    marginTop: 8,
  },
  retryText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
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
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerDate: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  readTimeBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  readTimeBadgeText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },

  // Title
  title: {
    fontSize: 38,
    lineHeight: 38 * 1.05,
    fontFamily: FontFamily.dramaBold,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginBottom: 36,
  },

  // Sections
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 16,
  },

  // Scripture
  scriptureRef: {
    ...TypeScale.monoLabel,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  scriptureText: {
    fontSize: 20,
    lineHeight: 20 * 1.5,
    fontFamily: FontFamily.drama,
    color: Colors.textPrimary,
  },

  // Body
  bodyText: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },

  keyboardAvoid: {
    flex: 1,
  },

  // Prayer
  prayerText: {
    fontSize: 18,
    lineHeight: 18 * 1.55,
    fontFamily: FontFamily.drama,
    color: Colors.textPrimary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 12,
    gap: 28,
  },
  authorText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  completeButton: {
    borderRadius: Config.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  completeButtonActive: {
    borderWidth: 0,
  },
  completeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 10,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 10,
  },
  completeText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textAccent,
    letterSpacing: 0.5,
  },
  completeTextActive: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
});
