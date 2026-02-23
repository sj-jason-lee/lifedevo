import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { TypeScale, FontFamily } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { useFadeIn } from '../../hooks/useFadeIn';
import type { Devotional } from '../../types';

interface HeroDevotionalProps {
  devotional: Devotional;
  index: number;
  completed?: boolean;
}

export const HeroDevotional = ({ devotional, index, completed }: HeroDevotionalProps): JSX.Element => {
  const fadeStyle = useFadeIn(index * Config.animation.stagger.card);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={fadeStyle}>
      <LinearGradient
        colors={[Colors.surfaceCard, Colors.surface, Colors.surfaceMuted]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.label}>TODAY&apos;S DEVOTIONAL</Text>
        <Text style={styles.title}>{devotional.title}</Text>
        <Text style={styles.scripture}>{devotional.scripture}</Text>
        <Text style={styles.body} numberOfLines={3}>
          {devotional.body}
        </Text>

        <AnimatedPressable
          style={styles.ctaContainer}
          onPress={() => router.push(`/devotional/${devotional.id}`)}
        >
          {!completed && <Animated.View style={[styles.ctaGlow, glowStyle]} />}
          <LinearGradient
            colors={completed ? [Colors.surfaceCard, Colors.surface] : [Colors.accent, '#B8972F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.ctaButton, completed && styles.ctaButtonCompleted]}
          >
            {completed && (
              <Feather name="check-circle" size={16} color={Colors.accent} style={{ marginRight: 8 }} />
            )}
            <Text style={completed ? styles.ctaTextCompleted : styles.ctaText}>
              {completed ? 'Completed' : 'Begin Reading'}
            </Text>
          </LinearGradient>
        </AnimatedPressable>

        <Text style={styles.readTime}>{devotional.readTimeMinutes} min read</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Config.radius.xl,
    padding: Config.spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    lineHeight: 40 * 1.05,
    fontFamily: FontFamily.dramaBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  scripture: {
    ...TypeScale.monoLabel,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  body: {
    ...TypeScale.body,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  ctaContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
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
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Config.radius.md,
  },
  ctaButtonCompleted: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  ctaTextCompleted: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  readTime: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
});
