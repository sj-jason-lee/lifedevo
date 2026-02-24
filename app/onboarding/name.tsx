import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
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
import { useOnboarding } from '../../lib/OnboardingContext';

const AnimatedView = Animated.View;

export default function NameScreen() {
  const insets = useSafeAreaInsets();
  const { setUserName } = useOnboarding();
  const [name, setName] = useState('');
  const focusProgress = useSharedValue(0);

  const headerFade = useFadeIn(0);
  const titleFade = useFadeIn(Config.animation.stagger.text);
  const inputFade = useFadeIn(Config.animation.stagger.text * 2);
  const ctaFade = useFadeIn(Config.animation.stagger.text * 3);

  const canContinue = name.trim().length > 0;

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 250 });
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 250 });
  };

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  const handleContinue = async () => {
    if (!canContinue) return;
    await setUserName(name.trim());
    router.push('/onboarding/church');
  };

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
          ]}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerFade]}>
            <View />
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 1 OF 2</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleFade}>
            <Text style={styles.heading}>What should{'\n'}we call you?</Text>
            <View style={styles.accentLine} />
          </Animated.View>

          {/* Input */}
          <Animated.View style={inputFade}>
            <AnimatedView style={[styles.inputWrapper, borderStyle]}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={handleContinue}
              />
            </AnimatedView>
          </Animated.View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* CTA */}
          <Animated.View style={ctaFade}>
            <AnimatedPressable
              style={[styles.ctaWrapper, !canContinue && styles.ctaDisabled]}
              onPress={handleContinue}
              haptic={canContinue}
            >
              <LinearGradient
                colors={[Colors.accent, '#B8972F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Continue</Text>
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>
        </View>
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
    flex: 1,
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
  stepBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  stepBadgeText: {
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

  // Input
  inputWrapper: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    fontFamily: FontFamily.body,
    fontSize: 18,
    color: Colors.textPrimary,
    padding: 18,
  },

  spacer: {
    flex: 1,
  },

  // CTA
  ctaWrapper: {
    borderRadius: Config.radius.md,
    overflow: 'hidden',
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
});
