import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useAuth } from '../../lib/AuthContext';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resendConfirmation } = useAuth();

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const headerFade = useFadeIn(0);
  const iconFade = useFadeIn(Config.animation.stagger.text);
  const titleFade = useFadeIn(Config.animation.stagger.text * 2);
  const bodyFade = useFadeIn(Config.animation.stagger.text * 3);
  const ctaFade = useFadeIn(Config.animation.stagger.text * 4);

  // Pulsing glow on the mail icon
  const glowOpacity = useSharedValue(0.3);
  glowOpacity.value = withRepeat(
    withTiming(1, { duration: 1500 }),
    -1,
    true
  );
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleResend = async () => {
    if (resending || !email) return;
    setError('');
    setResent(false);
    setResending(true);
    const { error: err } = await resendConfirmation(email);
    setResending(false);
    if (err) {
      setError(err);
    } else {
      setResent(true);
    }
  };

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
            onPress={() => router.replace('/auth')}
          >
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </AnimatedPressable>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VERIFY EMAIL</Text>
          </View>
        </Animated.View>

        {/* Center content */}
        <View style={styles.center}>
          {/* Mail icon with pulsing glow */}
          <Animated.View style={[styles.iconContainer, iconFade]}>
            <Animated.View style={[styles.iconGlow, glowStyle]} />
            <View style={styles.iconCircle}>
              <Feather name="mail" size={36} color={Colors.accent} />
            </View>
          </Animated.View>

          {/* Heading */}
          <Animated.View style={titleFade}>
            <Text style={styles.heading}>Check your{'\n'}inbox</Text>
            <View style={styles.accentLine} />
          </Animated.View>

          {/* Body text */}
          <Animated.View style={bodyFade}>
            <Text style={styles.bodyText}>
              We sent a confirmation link to
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.bodyText}>
              Tap the link in the email to verify your account, then come back and sign in.
            </Text>

            {error !== '' && <Text style={styles.errorText}>{error}</Text>}
            {resent && (
              <Text style={styles.successText}>Email resent successfully</Text>
            )}
          </Animated.View>
        </View>

        {/* Bottom actions */}
        <Animated.View style={ctaFade}>
          {/* Resend button */}
          <AnimatedPressable
            style={styles.resendButton}
            onPress={handleResend}
            haptic={!resending}
          >
            <Feather name="refresh-cw" size={18} color={Colors.textAccent} />
            <Text style={styles.resendText}>
              {resending ? 'Sending...' : 'Resend Email'}
            </Text>
          </AnimatedPressable>

          {/* Go to Sign In CTA */}
          <AnimatedPressable
            style={styles.ctaWrapper}
            onPress={() => router.replace('/auth/sign-in')}
          >
            <LinearGradient
              colors={[Colors.accent, '#B8972F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Go to Sign In</Text>
            </LinearGradient>
          </AnimatedPressable>

          {/* Footer link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Wrong email? </Text>
            <Pressable onPress={() => router.replace('/auth/sign-up')}>
              <Text style={styles.footerLink}>Sign up again</Text>
            </Pressable>
          </View>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  badge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  badgeText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },

  // Center
  center: {
    alignItems: 'center',
  },

  // Icon
  iconContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentGlow,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },

  // Title
  heading: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginBottom: 28,
    alignSelf: 'center',
  },

  // Body
  bodyText: {
    ...TypeScale.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    ...TypeScale.bodyMedium,
    color: Colors.textAccent,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    ...TypeScale.caption,
    color: '#E63B2E',
    textAlign: 'center',
    marginTop: 12,
  },
  successText: {
    ...TypeScale.caption,
    color: Colors.textAccent,
    textAlign: 'center',
    marginTop: 12,
  },

  // Resend button
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Config.radius.md,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    gap: 8,
    marginBottom: 12,
  },
  resendText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textAccent,
  },

  // CTA
  ctaWrapper: {
    borderRadius: Config.radius.md,
    overflow: 'hidden',
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

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },
  footerLink: {
    ...TypeScale.body,
    color: Colors.accent,
    fontFamily: FontFamily.headingSemiBold,
  },
});
