import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useAuth } from '../../lib/AuthContext';

const AnimatedView = Animated.View;

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailFocus = useSharedValue(0);
  const passwordFocus = useSharedValue(0);

  const headerFade = useFadeIn(0);
  const titleFade = useFadeIn(Config.animation.stagger.text);
  const formFade = useFadeIn(Config.animation.stagger.text * 2);
  const ctaFade = useFadeIn(Config.animation.stagger.text * 3);
  const socialFade = useFadeIn(Config.animation.stagger.text * 4);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return true; // don't show error on empty
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading && !emailError;

  const emailBorder = useAnimatedStyle(() => ({
    borderColor: interpolateColor(emailFocus.value, [0, 1], [Colors.border, Colors.accent]),
  }));

  const passwordBorder = useAnimatedStyle(() => ({
    borderColor: interpolateColor(passwordFocus.value, [0, 1], [Colors.border, Colors.accent]),
  }));

  const handleSignIn = async () => {
    if (!validateEmail(email)) return;
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    const { error: err } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: err } = await signInWithGoogle();
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerFade]}>
            <AnimatedPressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
            </AnimatedPressable>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SIGN IN</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleFade}>
            <Text style={styles.heading}>Welcome{'\n'}back</Text>
            <View style={styles.accentLine} />
          </Animated.View>

          {/* Form */}
          <Animated.View style={formFade}>
            <AnimatedView style={[styles.inputWrapper, emailBorder]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => { setEmail(v); setEmailError(''); }}
                onFocus={() => { emailFocus.value = withTiming(1, { duration: 250 }); }}
                onBlur={() => { emailFocus.value = withTiming(0, { duration: 250 }); validateEmail(email); }}
                placeholder="Email"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </AnimatedView>
            {emailError !== '' && <Text style={styles.fieldError}>{emailError}</Text>}

            <AnimatedView style={[styles.inputWrapper, styles.inputSpacing, passwordBorder]}>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => { passwordFocus.value = withTiming(1, { duration: 250 }); }}
                  onBlur={() => { passwordFocus.value = withTiming(0, { duration: 250 }); }}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </Pressable>
              </View>
            </AnimatedView>

            {error !== '' && <Text style={styles.errorText}>{error}</Text>}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={ctaFade}>
            <AnimatedPressable
              style={[styles.ctaWrapper, !canSubmit && styles.ctaDisabled]}
              onPress={handleSignIn}
              haptic={canSubmit}
            >
              <LinearGradient
                colors={[Colors.accent, '#B8972F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>

          {/* Divider */}
          <Animated.View style={[styles.dividerRow, socialFade]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View style={socialFade}>
            <AnimatedPressable style={styles.socialButton} onPress={handleGoogle}>
              <Ionicons name="logo-google" size={20} color={Colors.textPrimary} />
              <Text style={styles.socialText}>Google</Text>
            </AnimatedPressable>
          </Animated.View>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace('/auth/sign-up')}>
              <Text style={styles.footerLink}>Create one</Text>
            </Pressable>
          </View>
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
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

  // Title
  heading: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontFamily: FontFamily.heading,
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

  // Form
  inputWrapper: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputSpacing: {
    marginTop: 12,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: 18,
    color: Colors.textPrimary,
    padding: 18,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  fieldError: {
    ...TypeScale.caption,
    color: '#E63B2E',
    marginTop: 6,
  },
  errorText: {
    ...TypeScale.caption,
    color: '#E63B2E',
    marginTop: 12,
  },

  // CTA
  ctaWrapper: {
    borderRadius: Config.radius.md,
    overflow: 'hidden',
    marginTop: 24,
  },
  ctaDisabled: {
    opacity: 0.4,
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

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginHorizontal: 16,
  },

  // Social Buttons
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Config.radius.md,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    marginBottom: 12,
  },
  socialText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
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
