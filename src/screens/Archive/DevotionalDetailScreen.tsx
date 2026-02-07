import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../../components/Card';
import { useAppContext } from '../../services/store';

export function DevotionalDetailScreen({ route, navigation }: any) {
  const { devotionalId } = route.params;
  const { getDevotionalById, getJournalForDevotional, getPrayerForDevotional, isDevotionalCompleted } =
    useAppContext();

  const devotional = getDevotionalById(devotionalId);
  const journals = getJournalForDevotional(devotionalId);
  const prayer = getPrayerForDevotional(devotionalId);
  const completed = isDevotionalCompleted(devotionalId);

  if (!devotional) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Devotional not found</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(devotional.publishedAt)}</Text>
          {completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.completedLabel}>Completed</Text>
            </View>
          )}
        </View>

        <Text style={styles.scriptureRef}>{devotional.scriptureRef}</Text>

        <Card style={styles.scriptureCard}>
          <Text style={styles.scriptureText}>{devotional.scriptureText}</Text>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Reflection</Text>
          </View>
          <Text style={styles.authorName}>by {devotional.authorName}</Text>
          <Text style={styles.reflectionText}>{devotional.reflection}</Text>
        </View>

        {devotional.questions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Questions</Text>
            </View>
            {devotional.questions.map((q) => {
              const journal = journals.find((j) => j.questionId === q.id);
              return (
                <View key={q.id} style={styles.questionBlock}>
                  <Text style={styles.questionText}>{q.text}</Text>
                  {journal ? (
                    <Card style={styles.answerCard}>
                      <Text style={styles.answerText}>{journal.content}</Text>
                      <Text style={styles.answerDate}>
                        {new Date(journal.createdAt).toLocaleDateString()}
                      </Text>
                    </Card>
                  ) : (
                    <Text style={styles.noAnswer}>No journal entry yet</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {prayer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="hand-left-outline" size={18} color={colors.prayerBlue} />
              <Text style={styles.sectionTitle}>Your Prayer</Text>
            </View>
            <Card style={styles.prayerCard}>
              <Text style={styles.prayerText}>{prayer.content}</Text>
              {prayer.isAnswered && (
                <View style={styles.answeredBadge}>
                  <Ionicons name="checkmark-done" size={16} color={colors.success} />
                  <Text style={styles.answeredText}>Answered</Text>
                  {prayer.answerNote && (
                    <Text style={styles.answerNote}>{prayer.answerNote}</Text>
                  )}
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Free-form journal entries */}
        {journals.filter((j) => !j.questionId).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            {journals
              .filter((j) => !j.questionId)
              .map((j) => (
                <Card key={j.id} style={styles.answerCard}>
                  <Text style={styles.answerText}>{j.content}</Text>
                </Card>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.captionBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedLabel: {
    ...typography.caption,
    color: colors.success,
  },
  scriptureRef: {
    ...typography.largeTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  scriptureCard: {
    backgroundColor: colors.surfaceSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    marginBottom: spacing.lg,
  },
  scriptureText: {
    ...typography.scripture,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    marginBottom: spacing.md,
  },
  questionText: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  answerCard: {
    backgroundColor: '#F5F9F4',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  answerText: {
    ...typography.body,
    color: colors.text,
  },
  answerDate: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  noAnswer: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  prayerCard: {
    backgroundColor: '#F0F4F8',
    borderLeftWidth: 3,
    borderLeftColor: colors.prayerBlue,
  },
  prayerText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  answeredText: {
    ...typography.captionBold,
    color: colors.success,
  },
  answerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
