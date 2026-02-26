import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { GradientCard } from '../../components/ui/GradientCard';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useAuth } from '../../lib/AuthContext';
import { useOnboarding } from '../../lib/OnboardingContext';
import { useChurch } from '../../hooks/useChurch';
import { supabase } from '../../lib/supabase';
import { estimateReadTime, validateDevotional } from '../../lib/devotionalValidation';
import type { DevotionalRow, DevotionalStatus } from '../../types';

const STATUS_OPTIONS: DevotionalStatus[] = ['draft', 'scheduled', 'published'];

export default function EditDevotionalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const { church, isLeader } = useChurch();
  const isEditing = !!id;

  // Form state
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [body, setBody] = useState('');
  const [reflectQuestions, setReflectQuestions] = useState<string[]>(['']);
  const [prayer, setPrayer] = useState('');
  const [authorName, setAuthorName] = useState(userName);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [status, setStatus] = useState<DevotionalStatus>('draft');
  const [scheduledDateObj, setScheduledDateObj] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditing);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerFade = useFadeIn(0);

  // Load existing devotional for editing
  useEffect(() => {
    if (!id) return;
    supabase
      .from('devotionals')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          const row = data as DevotionalRow;
          setTitle(row.title);
          setScripture(row.scripture);
          setScriptureText(row.scripture_text);
          setBody(row.body);
          setReflectQuestions(row.reflect_questions.length > 0 ? row.reflect_questions : ['']);
          setPrayer(row.prayer);
          setAuthorName(row.author_name);
          setDate(row.date);
          setReadTimeMinutes(row.read_time_minutes);
          setStatus(row.status);
          if (row.scheduled_date) {
            setScheduledDateObj(new Date(row.scheduled_date));
          }
        }
        setIsLoadingEdit(false);
      });
  }, [id]);

  // Auto-calculate read time from body
  useEffect(() => {
    if (body.trim()) {
      setReadTimeMinutes(estimateReadTime(body));
    }
  }, [body]);

  const addQuestion = useCallback(() => {
    if (reflectQuestions.length < 5) {
      setReflectQuestions((prev) => [...prev, '']);
    }
  }, [reflectQuestions.length]);

  const removeQuestion = useCallback((index: number) => {
    setReflectQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuestion = useCallback((index: number, text: string) => {
    setReflectQuestions((prev) => prev.map((q, i) => (i === index ? text : q)));
  }, []);

  const validate = (): string | null => {
    if (!isEditing && !church) return 'You must be part of a church to create devotionals';
    if (!isEditing && !isLeader) return 'Only church leaders can create devotionals';
    const errors = validateDevotional({
      title,
      scripture,
      scripture_text: scriptureText,
      body,
      reflect_questions: reflectQuestions,
      prayer,
      date,
      status,
      scheduled_date: status === 'scheduled' ? scheduledDateObj.toISOString() : null,
    });
    return errors.length > 0 ? errors[0] : null;
  };

  const handleSave = useCallback(
    async (overrideStatus?: DevotionalStatus) => {
      const saveStatus = overrideStatus ?? status;
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setIsSaving(true);

      const validQuestions = reflectQuestions.filter((q) => q.trim());
      const payload = {
        title: title.trim(),
        scripture: scripture.trim(),
        scripture_text: scriptureText.trim(),
        body: body.trim(),
        reflect_questions: validQuestions,
        prayer: prayer.trim(),
        date,
        read_time_minutes: readTimeMinutes,
        author_name: authorName.trim() || userName,
        author_id: user?.id,
        status: saveStatus,
        scheduled_date: saveStatus === 'scheduled' ? scheduledDateObj.toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (isEditing && id) {
        result = await supabase.from('devotionals').update(payload).eq('id', id);
      } else {
        result = await supabase.from('devotionals').insert({
          ...payload,
          church_id: church?.id ?? null,
        });
      }

      setIsSaving(false);

      if (result.error) {
        setError(result.error.message);
      } else {
        router.back();
      }
    },
    [title, scripture, scriptureText, body, reflectQuestions, prayer, date, readTimeMinutes, authorName, status, scheduledDateObj, user, id, isEditing, userName]
  );

  if (isLoadingEdit) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <KeyboardAvoidingView
        style={styles.flex}
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
          {/* Header */}
          <Animated.View style={headerFade}>
            <View style={styles.headerRow}>
              <AnimatedPressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
              </AnimatedPressable>
              <AnimatedPressable
                style={styles.previewButton}
                onPress={() => setShowPreview(true)}
              >
                <Feather name="eye" size={18} color={Colors.textAccent} />
                <Text style={styles.previewButtonText}>Preview</Text>
              </AnimatedPressable>
            </View>
            <Text style={styles.headerLabel}>
              {isEditing ? 'EDIT DEVOTIONAL' : 'NEW DEVOTIONAL'}
            </Text>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit' : 'Create'}
            </Text>
            <View style={styles.accentLine} />
          </Animated.View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={16} color={Colors.accent} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="The Shepherd's Voice"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Scripture Reference */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SCRIPTURE REFERENCE</Text>
            <TextInput
              style={styles.input}
              value={scripture}
              onChangeText={setScripture}
              placeholder="John 10:27-28"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Scripture Text */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SCRIPTURE TEXT</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { minHeight: 100 }]}
              value={scriptureText}
              onChangeText={setScriptureText}
              placeholder="My sheep listen to my voice..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Body */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DEVOTIONAL BODY</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { minHeight: 200 }]}
              value={body}
              onChangeText={setBody}
              placeholder="Write the devotional content..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.fieldHint}>
              ~{readTimeMinutes} min read · {body.trim().split(/\s+/).filter(Boolean).length} words
            </Text>
          </View>

          {/* Reflect Questions */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>REFLECTION QUESTIONS</Text>
            {reflectQuestions.map((q, i) => (
              <View key={i} style={styles.questionRow}>
                <Text style={styles.questionNumber}>{i + 1}.</Text>
                <TextInput
                  style={[styles.input, styles.questionInput]}
                  value={q}
                  onChangeText={(text) => updateQuestion(i, text)}
                  placeholder="Enter a reflection question..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
                {reflectQuestions.length > 1 && (
                  <AnimatedPressable
                    style={styles.removeQuestionBtn}
                    onPress={() => removeQuestion(i)}
                  >
                    <Feather name="x-circle" size={20} color={Colors.textMuted} />
                  </AnimatedPressable>
                )}
              </View>
            ))}
            {reflectQuestions.length < 5 && (
              <AnimatedPressable style={styles.addQuestionBtn} onPress={addQuestion}>
                <Feather name="plus" size={16} color={Colors.textAccent} />
                <Text style={styles.addQuestionText}>Add Question</Text>
              </AnimatedPressable>
            )}
          </View>

          {/* Prayer */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PRAYER</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { minHeight: 100 }]}
              value={prayer}
              onChangeText={setPrayer}
              placeholder="Lord, ..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Author Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>AUTHOR NAME</Text>
            <TextInput
              style={styles.input}
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="Pastor James"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DATE</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Status */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((s) => (
                <AnimatedPressable
                  key={s}
                  style={[
                    styles.statusOption,
                    status === s && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && styles.statusOptionTextActive,
                    ]}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>

          {/* Scheduled Date (conditional) */}
          {status === 'scheduled' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>SCHEDULED DATE & TIME</Text>
              <View style={styles.pickerRow}>
                <AnimatedPressable
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Feather name="calendar" size={16} color={Colors.textAccent} />
                  <Text style={styles.pickerButtonText}>
                    {scheduledDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </AnimatedPressable>
                <AnimatedPressable
                  style={styles.pickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Feather name="clock" size={16} color={Colors.textAccent} />
                  <Text style={styles.pickerButtonText}>
                    {scheduledDateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </Text>
                </AnimatedPressable>
              </View>
              <Text style={styles.fieldHint}>Auto-publishes at the scheduled time</Text>
              {showDatePicker && (
                <DateTimePicker
                  value={scheduledDateObj}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event: DateTimePickerEvent, selected?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selected) {
                      const updated = new Date(scheduledDateObj);
                      updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                      setScheduledDateObj(updated);
                    }
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={scheduledDateObj}
                  mode="time"
                  onChange={(event: DateTimePickerEvent, selected?: Date) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selected) {
                      const updated = new Date(scheduledDateObj);
                      updated.setHours(selected.getHours(), selected.getMinutes());
                      setScheduledDateObj(updated);
                    }
                  }}
                />
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <AnimatedPressable
              style={styles.secondaryButton}
              onPress={() => handleSave('draft')}
              disabled={isSaving}
            >
              <Feather name="save" size={18} color={Colors.textAccent} />
              <Text style={styles.secondaryButtonText}>Save Draft</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => handleSave()}
              disabled={isSaving}
            >
              <LinearGradient
                colors={[Colors.accent, '#B8972F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.textDark} />
                ) : (
                  <>
                    <Feather
                      name={status === 'published' ? 'send' : status === 'scheduled' ? 'clock' : 'save'}
                      size={18}
                      color={Colors.textDark}
                    />
                    <Text style={styles.primaryButtonText}>
                      {status === 'published' ? 'Publish' : status === 'scheduled' ? 'Schedule' : 'Save'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" presentationStyle="fullScreen">
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: 16, paddingBottom: insets.bottom + 40 },
            ]}
          >
            <AnimatedPressable
              style={styles.backButton}
              onPress={() => setShowPreview(false)}
            >
              <Feather name="x" size={22} color={Colors.textPrimary} />
            </AnimatedPressable>

            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>PREVIEW</Text>
            </View>

            <Text style={styles.previewTitle}>{title || 'Untitled'}</Text>
            <View style={styles.accentLine} />

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionLabel}>SCRIPTURE</Text>
              <Text style={styles.previewScriptureRef}>{scripture}</Text>
              <Text style={styles.previewScriptureText}>
                &ldquo;{scriptureText}&rdquo;
              </Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionLabel}>DEVOTIONAL</Text>
              <Text style={styles.previewBody}>{body}</Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionLabel}>REFLECT</Text>
              {reflectQuestions.filter((q) => q.trim()).map((q, i) => (
                <View key={i} style={styles.previewQuestion}>
                  <Text style={styles.previewQuestionNumber}>{i + 1}.</Text>
                  <Text style={styles.previewQuestionText}>{q}</Text>
                </View>
              ))}
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionLabel}>PRAY</Text>
              <Text style={styles.previewPrayer}>{prayer}</Text>
            </View>

            <Text style={styles.previewAuthor}>Written by {authorName || 'Author'}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  previewButtonText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  headerLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginBottom: 24,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accentDim,
    padding: 14,
    borderRadius: Config.radius.sm,
    marginBottom: 20,
  },
  errorText: {
    ...TypeScale.body,
    color: Colors.textAccent,
    flex: 1,
  },

  // Fields
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 10,
  },
  fieldHint: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Config.radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  // Questions
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  questionNumber: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginTop: 16,
  },
  questionInput: {
    flex: 1,
  },
  removeQuestionBtn: {
    marginTop: 14,
    padding: 4,
  },
  addQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    alignSelf: 'flex-start',
  },
  addQuestionText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  statusOptionText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
    color: Colors.textMuted,
  },
  statusOptionTextActive: {
    color: Colors.textAccent,
  },

  // Picker
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    backgroundColor: Colors.surfaceCard,
  },
  pickerButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  // Actions
  actionSection: {
    marginTop: 16,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    backgroundColor: Colors.surfaceCard,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textAccent,
    letterSpacing: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Config.radius.md,
  },
  primaryButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },

  // Preview modal
  previewBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Config.radius.sm,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
  },
  previewBadgeText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  previewTitle: {
    fontSize: 38,
    lineHeight: 38 * 1.05,
    fontFamily: FontFamily.dramaBold,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  previewSection: {
    marginBottom: 36,
  },
  previewSectionLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 16,
  },
  previewScriptureRef: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  previewScriptureText: {
    fontSize: 20,
    lineHeight: 30,
    fontFamily: FontFamily.drama,
    color: Colors.textPrimary,
  },
  previewBody: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },
  previewQuestion: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  previewQuestionNumber: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },
  previewQuestionText: {
    ...TypeScale.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  previewPrayer: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: FontFamily.drama,
    color: Colors.textPrimary,
  },
  previewAuthor: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
