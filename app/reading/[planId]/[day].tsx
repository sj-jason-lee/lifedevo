import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { FontFamily, TypeScale } from '../../../constants/typography';
import { Config } from '../../../constants/config';
import { AnimatedPressable } from '../../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../../hooks/useFadeIn';
import { useReadingPlan } from '../../../lib/ReadingPlanContext';

export default function PassageDetailScreen() {
  const { planId, day } = useLocalSearchParams<{ planId: string; day: string }>();
  const insets = useSafeAreaInsets();
  const dayNumber = parseInt(day ?? '1', 10);
  const { allPlans, isDayComplete, toggleDay } = useReadingPlan();
  const plan = allPlans.find((p) => p.id === planId);
  const planDay = plan?.days.find((d) => d.day === dayNumber);
  const isComplete = planDay ? isDayComplete(planId ?? '', dayNumber) : false;

  const headerFade = useFadeIn(0);
  const badgeFade = useFadeIn(Config.animation.stagger.text);
  const passageFade = useFadeIn(Config.animation.stagger.text * 2);
  const instructionFade = useFadeIn(Config.animation.stagger.text * 3);
  const buttonFade = useFadeIn(Config.animation.stagger.text * 4);

  if (!planDay) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Passage not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerFade]}>
          <AnimatedPressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </AnimatedPressable>
        </Animated.View>

        {/* Centered content */}
        <View style={styles.centerSection}>
          <Animated.View style={[styles.dayBadge, badgeFade]}>
            <Text style={styles.dayBadgeText}>DAY {dayNumber}</Text>
          </Animated.View>

          <Animated.View style={passageFade}>
            <Text style={styles.passageName}>{planDay.passage}</Text>
          </Animated.View>

          <Animated.View style={instructionFade}>
            <View style={styles.accentLine} />
            <Text style={styles.instruction}>
              Open your Bible and read this passage. Take your time — let the words settle.
            </Text>
          </Animated.View>
        </View>

        {/* Complete button */}
        <Animated.View style={[styles.footer, buttonFade]}>
          <AnimatedPressable
            style={[
              styles.completeButton,
              isComplete && styles.completeButtonActive,
            ]}
            onPress={() => toggleDay(planId ?? '', dayNumber)}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
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

  // Center
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Config.radius.sm,
    marginBottom: 20,
  },
  dayBadgeText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  passageName: {
    fontSize: 44,
    lineHeight: 44 * 1.05,
    fontFamily: FontFamily.dramaBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    alignSelf: 'center',
    marginBottom: 20,
  },
  instruction: {
    ...TypeScale.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
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
