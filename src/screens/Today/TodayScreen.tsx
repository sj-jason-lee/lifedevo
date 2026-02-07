import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StreakBadge } from '../../components/StreakBadge';
import { useAppContext } from '../../services/store';

type DevotionalStep = 'scripture' | 'reflection' | 'questions' | 'prayer' | 'share' | 'complete';

const STEPS: DevotionalStep[] = ['scripture', 'reflection', 'questions', 'prayer', 'share', 'complete'];

export function TodayScreen() {
  const {
    user,
    getTodayDevotional,
    getJournalForDevotional,
    getPrayerForDevotional,
    saveJournalEntry,
    savePrayer,
    completeDevotional,
    isDevotionalCompleted,
  } = useAppContext();

  const devotional = getTodayDevotional();
  const [currentStep, setCurrentStep] = useState<DevotionalStep>('scripture');
  const [journalAnswers, setJournalAnswers] = useState<Record<string, string>>({});
  const [freeNotes, setFreeNotes] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [isPrayerRequest, setIsPrayerRequest] = useState(false);
  const [shareReflection, setShareReflection] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isCompleted = devotional ? isDevotionalCompleted(devotional.id) : false;

  if (!devotional) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today</Text>
          {user && <StreakBadge count={user.streakCount} />}
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="sunny-outline" size={64} color={colors.secondary} />
          <Text style={styles.emptyTitle}>No Devotional Yet</Text>
          <Text style={styles.emptyMessage}>
            Your pastor hasn't published today's devotional yet.{'\n'}Check back soon!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSaveAndComplete = () => {
    if (!user || !devotional) return;

    // Save journal entries
    Object.entries(journalAnswers).forEach(([questionId, content]) => {
      if (content.trim()) {
        saveJournalEntry({
          userId: user.id,
          devotionalId: devotional.id,
          questionId,
          content: content.trim(),
          isShared: shareReflection,
        });
      }
    });

    if (freeNotes.trim()) {
      saveJournalEntry({
        userId: user.id,
        devotionalId: devotional.id,
        content: freeNotes.trim(),
        isShared: shareReflection,
      });
    }

    // Save prayer
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

    completeDevotional(devotional.id, hasJournal, hasPrayer, shareReflection);
    setCurrentStep('complete');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const renderProgressDots = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            index <= currentStepIndex && styles.progressDotActive,
            index === currentStepIndex && styles.progressDotCurrent,
          ]}
        />
      ))}
    </View>
  );

  const renderScripture = () => (
    <View style={styles.stepContent}>
      <View style={styles.scriptureHeader}>
        <Ionicons name="book-outline" size={20} color={colors.primary} />
        <Text style={styles.stepLabel}>Scripture Reading</Text>
      </View>
      <Text style={styles.scriptureRef}>{devotional.scriptureRef}</Text>
      <Card style={styles.scriptureCard}>
        <Text style={styles.scriptureText}>{devotional.scriptureText}</Text>
      </Card>
      <Button title="Continue to Reflection" onPress={goNext} style={styles.nextButton} />
    </View>
  );

  const renderReflection = () => (
    <View style={styles.stepContent}>
      <View style={styles.scriptureHeader}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
        <Text style={styles.stepLabel}>Pastoral Reflection</Text>
      </View>
      <Text style={styles.authorName}>by {devotional.authorName}</Text>
      <Text style={styles.reflectionText}>{devotional.reflection}</Text>
      <View style={styles.navButtons}>
        <Button title="Back" onPress={goPrev} variant="outline" style={styles.navButton} />
        <Button title="Continue" onPress={goNext} style={styles.navButton} />
      </View>
    </View>
  );

  const renderQuestions = () => (
    <View style={styles.stepContent}>
      <View style={styles.scriptureHeader}>
        <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        <Text style={styles.stepLabel}>Reflect & Journal</Text>
      </View>
      {devotional.questions.map((question) => (
        <View key={question.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>{question.text}</Text>
          <TextInput
            style={styles.journalInput}
            placeholder="Write your thoughts..."
            placeholderTextColor={colors.textTertiary}
            multiline
            value={journalAnswers[question.id] || ''}
            onChangeText={(text) =>
              setJournalAnswers((prev) => ({ ...prev, [question.id]: text }))
            }
            textAlignVertical="top"
          />
        </View>
      ))}
      <View style={styles.questionBlock}>
        <Text style={styles.questionText}>Additional Notes</Text>
        <TextInput
          style={styles.journalInput}
          placeholder="Any other thoughts or observations..."
          placeholderTextColor={colors.textTertiary}
          multiline
          value={freeNotes}
          onChangeText={setFreeNotes}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.navButtons}>
        <Button title="Back" onPress={goPrev} variant="outline" style={styles.navButton} />
        <Button title="Continue to Prayer" onPress={goNext} style={styles.navButton} />
      </View>
    </View>
  );

  const renderPrayer = () => (
    <View style={styles.stepContent}>
      <View style={styles.scriptureHeader}>
        <Ionicons name="hand-left-outline" size={20} color={colors.primary} />
        <Text style={styles.stepLabel}>Prayer Response</Text>
      </View>
      <Card style={styles.prayerPromptCard}>
        <Text style={styles.prayerPromptText}>{devotional.prayerPrompt}</Text>
      </Card>
      <TextInput
        style={[styles.journalInput, styles.prayerInput]}
        placeholder="Write your prayer..."
        placeholderTextColor={colors.textTertiary}
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
          size={22}
          color={isPrayerRequest ? colors.primary : colors.textTertiary}
        />
        <Text style={styles.checkboxLabel}>
          Share as a prayer request with my church
        </Text>
      </TouchableOpacity>
      <View style={styles.navButtons}>
        <Button title="Back" onPress={goPrev} variant="outline" style={styles.navButton} />
        <Button title="Continue" onPress={goNext} style={styles.navButton} />
      </View>
    </View>
  );

  const renderShare = () => (
    <View style={styles.stepContent}>
      <View style={styles.scriptureHeader}>
        <Ionicons name="people-outline" size={20} color={colors.primary} />
        <Text style={styles.stepLabel}>Share with Community</Text>
      </View>
      <Text style={styles.shareDescription}>
        Would you like to share your reflection with your church community? Shared entries appear in the Community tab where others can encourage you.
      </Text>
      <TouchableOpacity
        style={[styles.shareOption, shareReflection && styles.shareOptionActive]}
        onPress={() => setShareReflection(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={shareReflection ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={shareReflection ? colors.primary : colors.textTertiary}
        />
        <View style={styles.shareOptionText}>
          <Text style={styles.shareOptionTitle}>Yes, share my reflection</Text>
          <Text style={styles.shareOptionDesc}>Your journal entries for today will be visible to your church</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.shareOption, !shareReflection && styles.shareOptionActive]}
        onPress={() => setShareReflection(false)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={!shareReflection ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={!shareReflection ? colors.primary : colors.textTertiary}
        />
        <View style={styles.shareOptionText}>
          <Text style={styles.shareOptionTitle}>Keep it private</Text>
          <Text style={styles.shareOptionDesc}>Your entries will only be visible to you</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.navButtons}>
        <Button title="Back" onPress={goPrev} variant="outline" style={styles.navButton} />
        <Button title="Complete Devotional" onPress={handleSaveAndComplete} style={styles.navButton} />
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <View style={styles.completeIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>
      <Text style={styles.completeTitle}>Devotional Complete!</Text>
      <Text style={styles.completeMessage}>
        Great job staying in the Word today. Your faithfulness matters.
      </Text>
      {user && (
        <View style={styles.streakContainer}>
          <StreakBadge count={user.streakCount} size="lg" />
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      )}
      <Text style={styles.completeVerse}>
        "Blessed is the one... whose delight is in the law of the Lord, and who meditates on his law day and night."
      </Text>
      <Text style={styles.completeRef}>— Psalm 1:1-2</Text>
    </View>
  );

  const renderStep = () => {
    if (isCompleted) return renderComplete();
    switch (currentStep) {
      case 'scripture': return renderScripture();
      case 'reflection': return renderReflection();
      case 'questions': return renderQuestions();
      case 'prayer': return renderPrayer();
      case 'share': return renderShare();
      case 'complete': return renderComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Today</Text>
            <Text style={styles.headerDate}>{formatDate(devotional.publishedAt)}</Text>
          </View>
          {user && <StreakBadge count={user.streakCount} />}
        </View>
        {!isCompleted && renderProgressDots()}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.largeTitle,
    color: colors.text,
  },
  headerDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  progressDotActive: {
    backgroundColor: colors.primaryLight,
  },
  progressDotCurrent: {
    backgroundColor: colors.primary,
    width: 24,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepContent: {
    paddingTop: spacing.md,
  },
  scriptureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepLabel: {
    ...typography.captionBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scriptureRef: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },
  scriptureCard: {
    backgroundColor: colors.surfaceSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  scriptureText: {
    ...typography.scripture,
    color: colors.text,
  },
  authorName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  reflectionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 28,
  },
  questionBlock: {
    marginBottom: spacing.lg,
  },
  questionText: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  journalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    ...typography.body,
    color: colors.text,
  },
  prayerPromptCard: {
    backgroundColor: '#F0F4F8',
    borderLeftWidth: 3,
    borderLeftColor: colors.prayerBlue,
    marginBottom: spacing.md,
  },
  prayerPromptText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
  },
  prayerInput: {
    minHeight: 140,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  shareDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  shareOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F5F9F4',
  },
  shareOptionText: {
    flex: 1,
  },
  shareOptionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  shareOptionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  navButton: {
    flex: 1,
  },
  nextButton: {
    marginTop: spacing.xl,
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
    lineHeight: 24,
  },
  completeContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  completeIcon: {
    marginBottom: spacing.md,
  },
  completeTitle: {
    ...typography.largeTitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  completeMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  completeVerse: {
    ...typography.scripture,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
  },
  completeRef: {
    ...typography.captionBold,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
