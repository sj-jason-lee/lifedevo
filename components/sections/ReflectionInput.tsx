import { useState, useCallback } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { useReflections } from '../../lib/ReflectionContext';
import { useOnboarding } from '../../lib/OnboardingContext';

interface ReflectionInputProps {
  devotionalId: string;
  devotionalTitle: string;
  scripture: string;
  questionIndex: number;
  questionText: string;
}

const AnimatedView = Animated.View;

export const ReflectionInput = ({
  devotionalId,
  devotionalTitle,
  scripture,
  questionIndex,
  questionText,
}: ReflectionInputProps): JSX.Element => {
  const { getAnswer, updateAnswer, shareReflection, isShared } =
    useReflections();
  const { userName, initials, churchCode } = useOnboarding();
  const [text, setText] = useState(() =>
    getAnswer(devotionalId, questionIndex)
  );
  const shared = isShared(devotionalId, questionIndex);
  const focusProgress = useSharedValue(0);

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);
      updateAnswer(devotionalId, questionIndex, value);
    },
    [devotionalId, questionIndex, updateAnswer]
  );

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 250 });
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 250 });
  };

  const handleShare = () => {
    if (!text.trim() || shared) return;
    shareReflection({
      devotionalId,
      devotionalTitle,
      scripture,
      questionIndex,
      questionText,
      answerText: text.trim(),
      authorName: userName || 'You',
      authorInitials: initials || 'ME',
      churchCode,
    });
  };

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.questionRow}>
        <Text style={styles.questionNumber}>{questionIndex + 1}</Text>
        <Text style={styles.questionText}>{questionText}</Text>
      </View>

      <AnimatedView style={[styles.inputWrapper, borderStyle]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Write your reflection..."
          placeholderTextColor={Colors.textMuted}
          multiline
          textAlignVertical="top"
        />
      </AnimatedView>

      {text.trim().length > 0 && (
        <AnimatedPressable
          style={[styles.shareButton, shared && styles.shareButtonActive]}
          onPress={handleShare}
          haptic={!shared}
        >
          <Feather
            name={shared ? 'check-circle' : 'send'}
            size={14}
            color={shared ? Colors.accent : Colors.textMuted}
          />
          <Text
            style={[styles.shareText, shared && styles.shareTextActive]}
          >
            {shared ? 'Shared' : 'Share with community'}
          </Text>
        </AnimatedPressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 14,
  },
  questionNumber: {
    ...TypeScale.monoLabel,
    color: Colors.textAccent,
    marginTop: 3,
  },
  questionText: {
    ...TypeScale.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    ...TypeScale.body,
    color: Colors.textPrimary,
    padding: 16,
    minHeight: 80,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Config.radius.sm,
  },
  shareButtonActive: {
    backgroundColor: Colors.accentSoft,
  },
  shareText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  shareTextActive: {
    color: Colors.accent,
  },
});
