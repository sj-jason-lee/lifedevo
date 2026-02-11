import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../../components/Card';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppContext } from '../../services/store';

export function TodayScreen({ navigation }: any) {
  const {
    user,
    getTodayDevotional,
    saveJournalEntry,
    savePrayer,
    completeDevotional,
    isDevotionalCompleted,
  } = useAppContext();

  const devotional = getTodayDevotional();
  const [journalAnswers, setJournalAnswers] = useState<Record<string, string>>({});
  const [freeNotes, setFreeNotes] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [isPrayerRequest, setIsPrayerRequest] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showPrayer, setShowPrayer] = useState(false);

  const isPastor = user?.role === 'pastor' || user?.role === 'admin';
  const isCompleted = devotional ? isDevotionalCompleted(devotional.id) : false;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleComplete = () => {
    if (!user || !devotional) return;

    Object.entries(journalAnswers).forEach(([questionId, content]) => {
      if (content.trim()) {
        saveJournalEntry({
          userId: user.id,
          devotionalId: devotional.id,
          questionId,
          content: content.trim(),
          isShared: false,
        });
      }
    });

    if (freeNotes.trim()) {
      saveJournalEntry({
        userId: user.id,
        devotionalId: devotional.id,
        content: freeNotes.trim(),
        isShared: false,
      });
    }

    if (prayerText.trim()) {
      savePrayer({
        userId: user.id,
        userName: user.name,
        devotionalId: devotional.id,
        content: prayerText.trim(),
        isRequest: isPrayerRequest,
        isAnswered: false,
        isShared: isPrayerRequest,
      });
    }

    const hasJournal = Object.values(journalAnswers).some((a) => a.trim()) || freeNotes.trim() !== '';
    const hasPrayer = prayerText.trim() !== '';
    completeDevotional(devotional.id, hasJournal, hasPrayer, false);
  };

  if (!devotional) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Today" streakCount={user?.streakCount || 0} />
        <View style={styles.emptyContainer}>
          <Ionicons name="sunny-outline" size={56} color={colors.secondary} />
          <Text style={styles.emptyTitle}>No Devotional Yet</Text>
          <Text style={styles.emptyMessage}>
            {isPastor
              ? "You haven't published today's devotional yet."
              : "Your pastor hasn't published today's devotional yet.\nCheck back soon!"}
          </Text>
          {isPastor && (
            <Button
              title="Write Today's Devotional"
              onPress={() => navigation.navigate('CreateDevotional')}
              size="lg"
              style={styles.writeButton}
              icon={<Ionicons name="create-outline" size={20} color={colors.white} />}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        subtitle={formatDate(devotional.publishedAt)}
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
          {/* Scripture */}
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>TODAY'S SCRIPTURE</Text>
          </View>

          <Card style={styles.scriptureCard}>
            <View style={styles.scriptureRefRow}>
              <Text style={styles.scriptureRef}>{devotional.scriptureRef.toUpperCase()}</Text>
              <View style={styles.esvBadge}>
                <Text style={styles.esvText}>ESV</Text>
              </View>
            </View>
            <Text style={styles.scriptureText}>{devotional.scriptureText}</Text>
          </Card>

          {/* Reflection */}
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>PASTOR'S REFLECTION</Text>
          </View>

          <View style={styles.sectionContent}>
            <Text style={styles.authorName}>by {devotional.authorName}</Text>
            <Text style={styles.reflectionText}>{devotional.reflection}</Text>
          </View>

          {/* Questions */}
          {devotional.questions.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="help-circle-outline" size={15} color={colors.textTertiary} />
                <Text style={styles.sectionLabel}>REFLECT</Text>
              </View>

              {devotional.questions.map((question, index) => (
                <View key={question.id} style={styles.questionBlock}>
                  <Text style={styles.questionText}>
                    {index + 1}. {question.text}
                  </Text>
                  {showJournal && (
                    <TextInput
                      style={styles.journalInput}
                      placeholder="Write your thoughts..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      value={journalAnswers[question.id] || ''}
                      onChangeText={(text) =>
                        setJournalAnswers((prev) => ({ ...prev, [question.id]: text }))
                      }
                      textAlignVertical="top"
                    />
                  )}
                </View>
              ))}

              {!showJournal ? (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setShowJournal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.secondary} />
                  <Text style={styles.expandButtonText}>Journal Your Answers</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.notesBlock}>
                  <Text style={styles.notesLabel}>Additional Notes</Text>
                  <TextInput
                    style={styles.journalInput}
                    placeholder="Any other thoughts..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={freeNotes}
                    onChangeText={setFreeNotes}
                    textAlignVertical="top"
                  />
                </View>
              )}
            </>
          )}

          {/* Prayer */}
          <View style={styles.sectionHeader}>
            <Ionicons name="hand-left-outline" size={15} color={colors.textTertiary} />
            <Text style={styles.sectionLabel}>PRAYER</Text>
          </View>

          <Card style={styles.prayerPromptCard}>
            <Text style={styles.prayerPromptText}>{devotional.prayerPrompt}</Text>
          </Card>

          {showPrayer ? (
            <View style={styles.prayerInputContainer}>
              <TextInput
                style={[styles.journalInput, { minHeight: 100 }]}
                placeholder="Write your prayer..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={prayerText}
                onChangeText={setPrayerText}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsPrayerRequest(!isPrayerRequest)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPrayerRequest ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isPrayerRequest ? colors.primary : colors.textMuted}
                />
                <Text style={styles.checkboxLabel}>Share as prayer request</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setShowPrayer(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={colors.secondary} />
              <Text style={styles.expandButtonText}>Write a Prayer</Text>
            </TouchableOpacity>
          )}

          {/* Complete */}
          {!isCompleted ? (
            <Button
              title="Complete Today's Devotional"
              onPress={handleComplete}
              size="lg"
              style={styles.completeButton}
            />
          ) : (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={22} color={colors.completedGreen} />
              <Text style={styles.completedText}>Devotional Completed</Text>
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {isPastor && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateDevotional')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
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
  sectionContent: {
    paddingHorizontal: spacing.lg,
  },
  scriptureCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  scriptureRefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scriptureRef: {
    ...typography.captionBold,
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  esvBadge: {
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  esvText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  scriptureText: {
    ...typography.scripture,
    color: colors.text,
  },
  authorName: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  reflectionText: {
    ...typography.body,
    color: colors.text,
  },
  questionBlock: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  questionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  journalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  notesBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  notesLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  expandButtonText: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  prayerPromptCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.textTertiary,
  },
  prayerPromptText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 15,
  },
  prayerInputContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkboxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  completeButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: '#EFF7F0',
    borderRadius: borderRadius.md,
  },
  completedText: {
    ...typography.bodyBold,
    color: colors.completedGreen,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  writeButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
