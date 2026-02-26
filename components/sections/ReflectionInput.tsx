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

interface ReflectionInputProps {
  devotionalId: string;
  questionIndex: number;
  questionText: string;
}

const AnimatedView = Animated.View;

export const ReflectionInput = ({
  devotionalId,
  questionIndex,
  questionText,
}: ReflectionInputProps): JSX.Element => {
  const { getAnswer, updateAnswer, getShareFlag, setShareFlag, isShared } =
    useReflections();
  const [text, setText] = useState(() =>
    getAnswer(devotionalId, questionIndex)
  );
  const shared = isShared(devotionalId, questionIndex);
  const shareFlag = getShareFlag(devotionalId, questionIndex);
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

  const handleToggleShare = () => {
    if (shared) return; // already shared — can't toggle
    setShareFlag(devotionalId, questionIndex, !shareFlag);
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
          accessibilityLabel={`Reflection for question ${questionIndex + 1}: ${questionText}`}
        />
      </AnimatedView>

      {text.trim().length > 0 && (
        <AnimatedPressable
          style={[
            styles.toggleRow,
            shared && styles.toggleRowShared,
          ]}
          onPress={handleToggleShare}
          haptic={!shared}
        >
          <Feather
            name={shared ? 'check-circle' : shareFlag ? 'users' : 'lock'}
            size={13}
            color={shared ? Colors.accent : shareFlag ? Colors.accent : Colors.textMuted}
          />
          <Text
            style={[
              styles.toggleLabel,
              shared && styles.toggleLabelShared,
              !shared && shareFlag && styles.toggleLabelActive,
            ]}
          >
            {shared ? 'Shared' : shareFlag ? 'Share with church' : 'Keep private'}
          </Text>
          {!shared && shareFlag && <View style={styles.toggleDot} />}
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Config.radius.sm,
  },
  toggleRowShared: {
    backgroundColor: Colors.accentSoft,
  },
  toggleLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  toggleLabelActive: {
    color: Colors.accent,
  },
  toggleLabelShared: {
    color: Colors.accent,
  },
  toggleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accent,
  },
});
