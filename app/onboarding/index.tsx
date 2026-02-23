import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const logoFade = useFadeIn(0);
  const taglineFade = useFadeIn(Config.animation.stagger.text * 2);
  const lineFade = useFadeIn(Config.animation.stagger.text * 3);
  const ctaFade = useFadeIn(Config.animation.stagger.text * 4);

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

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Logo / Title */}
        <View style={styles.hero}>
          <Animated.View style={logoFade}>
            <Text style={styles.appName}>Pasture</Text>
          </Animated.View>

          <Animated.View style={taglineFade}>
            <Text style={styles.tagline}>
              Daily devotionals for{'\n'}your spiritual journey
            </Text>
          </Animated.View>

          <Animated.View style={lineFade}>
            <View style={styles.accentLine} />
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View style={ctaFade}>
          <AnimatedPressable
            style={styles.ctaWrapper}
            onPress={() => router.push('/onboarding/name')}
          >
            <Animated.View style={[styles.ctaGlow, glowStyle]} />
            <LinearGradient
              colors={[Colors.accent, '#B8972F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Get Started</Text>
            </LinearGradient>
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
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 52,
    lineHeight: 52 * 1.05,
    fontFamily: FontFamily.dramaBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 20,
    lineHeight: 20 * 1.4,
    fontFamily: FontFamily.drama,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },

  // CTA
  ctaWrapper: {
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: Config.radius.md,
  },
  ctaText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 17,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
});
