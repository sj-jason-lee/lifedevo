import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../../components/Card';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppContext } from '../../services/store';

export function CreateDevotionalScreen({ navigation, route }: any) {
  const { user, publishDevotional } = useAppContext();
  const targetDate: string | undefined = route?.params?.date;

  const [scriptureRef, setScriptureRef] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [reflection, setReflection] = useState('');
  const [prayerPrompt, setPrayerPrompt] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [isPublishing, setIsPublishing] = useState(false);

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, '']);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = text;
    setQuestions(updated);
  };

  const handlePublish = async () => {
    if (!scriptureRef.trim()) {
      Alert.alert('Missing Field', 'Please enter a scripture reference.');
      return;
    }
    if (!scriptureText.trim()) {
      Alert.alert('Missing Field', 'Please enter the scripture text.');
      return;
    }
    if (!reflection.trim()) {
      Alert.alert('Missing Field', 'Please write your reflection.');
      return;
    }
    if (!prayerPrompt.trim()) {
      Alert.alert('Missing Field', 'Please add a prayer prompt.');
      return;
    }

    const validQuestions = questions.filter((q) => q.trim());
    if (validQuestions.length === 0) {
      Alert.alert('Missing Field', 'Please add at least one reflection question.');
      return;
    }

    setIsPublishing(true);
    const error = await publishDevotional({
      scriptureRef: scriptureRef.trim(),
      scriptureText: scriptureText.trim(),
      reflection: reflection.trim(),
      prayerPrompt: prayerPrompt.trim(),
      questions: validQuestions.map((q) => q.trim()),
      publishDate: targetDate,
    });
    setIsPublishing(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      const dateLabel = targetDate
        ? new Date(targetDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        : 'today';
      Alert.alert('Published!', `Devotional for ${dateLabel} is scheduled.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle={targetDate
          ? new Date(targetDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : 'New Devotional'}
        streakCount={user?.streakCount || 0}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Scripture Reference */}
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>SCRIPTURE</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Reference</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John 3:16-17"
              placeholderTextColor={colors.textMuted}
              value={scriptureRef}
              onChangeText={setScriptureRef}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Scripture Text</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Paste or type the scripture passage..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={scriptureText}
              onChangeText={setScriptureText}
              textAlignVertical="top"
            />
          </View>

          {/* Reflection */}
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>YOUR REFLECTION</Text>
          </View>

          <View style={styles.fieldContainer}>
            <TextInput
              style={[styles.input, styles.largeInput]}
              placeholder="Share your thoughts on this passage..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={reflection}
              onChangeText={setReflection}
              textAlignVertical="top"
            />
          </View>

          {/* Questions */}
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>REFLECTION QUESTIONS</Text>
          </View>

          {questions.map((q, index) => (
            <View key={index} style={styles.questionRow}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              <TextInput
                style={[styles.input, styles.questionInput]}
                placeholder="Enter a question for your church..."
                placeholderTextColor={colors.textMuted}
                value={q}
                onChangeText={(text) => updateQuestion(index, text)}
              />
              {questions.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeQuestion(index)}
                  style={styles.removeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {questions.length < 5 && (
            <TouchableOpacity
              style={styles.addQuestionButton}
              onPress={addQuestion}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.secondary} />
              <Text style={styles.addQuestionText}>Add Question</Text>
            </TouchableOpacity>
          )}

          {/* Prayer Prompt */}
          <View style={styles.sectionHeader}>
            <Ionicons name="hand-left-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>PRAYER PROMPT</Text>
          </View>

          <View style={styles.fieldContainer}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Guide your church in prayer..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={prayerPrompt}
              onChangeText={setPrayerPrompt}
              textAlignVertical="top"
            />
          </View>

          {/* Preview */}
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>PREVIEW</Text>
          </View>

          {scriptureRef.trim() || scriptureText.trim() ? (
            <Card style={styles.previewCard}>
              {scriptureRef.trim() ? (
                <Text style={styles.previewRef}>{scriptureRef.toUpperCase()}</Text>
              ) : null}
              {scriptureText.trim() ? (
                <Text style={styles.previewScripture}>{scriptureText}</Text>
              ) : null}
              {reflection.trim() ? (
                <>
                  <View style={styles.previewDivider} />
                  <Text style={styles.previewAuthor}>by {user?.name}</Text>
                  <Text style={styles.previewReflection}>{reflection}</Text>
                </>
              ) : null}
            </Card>
          ) : (
            <Card style={styles.previewCard}>
              <Text style={styles.previewEmpty}>
                Start filling in the fields above to see a preview
              </Text>
            </Card>
          )}

          {/* Publish */}
          <Button
            title={isPublishing ? 'Publishing...' : 'Publish Devotional'}
            onPress={handlePublish}
            size="lg"
            disabled={isPublishing}
            loading={isPublishing}
            style={styles.publishButton}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
  },
  fieldContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 100,
  },
  largeInput: {
    minHeight: 150,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  questionNumber: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    width: 20,
  },
  questionInput: {
    flex: 1,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
  },
  addQuestionText: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  previewCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  previewRef: {
    ...typography.captionBold,
    color: colors.secondary,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  previewScripture: {
    ...typography.scripture,
    color: colors.text,
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  previewAuthor: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  previewReflection: {
    ...typography.body,
    color: colors.text,
  },
  previewEmpty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  publishButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
