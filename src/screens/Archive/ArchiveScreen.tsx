import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { AppHeader } from '../../components/AppHeader';
import { useAppContext } from '../../services/store';
import { Devotional } from '../../types';

export function ArchiveScreen({ navigation }: any) {
  const { user, devotionals, isDevotionalCompleted, getJournalForDevotional } = useAppContext();

  const publishedDevotionals = devotionals
    .filter((d) => d.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderDevotional = ({ item }: { item: Devotional }) => {
    const completed = isDevotionalCompleted(item.id);
    const journals = getJournalForDevotional(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('DevotionalDetail', { devotionalId: item.id })}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{formatDate(item.publishedAt)}</Text>
              {completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.scriptureRef}>{item.scriptureRef}</Text>
          <Text style={styles.reflectionPreview} numberOfLines={2}>
            {item.reflection}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.authorText}>by {item.authorName}</Text>
            <View style={styles.statsRow}>
              {journals.length > 0 && (
                <View style={styles.stat}>
                  <Ionicons name="pencil" size={12} color={colors.textTertiary} />
                  <Text style={styles.statText}>{journals.length}</Text>
                </View>
              )}
              <Text style={styles.questionsText}>
                {item.questions.length} question{item.questions.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Archive" streakCount={user?.streakCount || 0} />
      <FlatList
        data={publishedDevotionals}
        renderItem={renderDevotional}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  completedText: {
    ...typography.caption,
    color: colors.success,
  },
  scriptureRef: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reflectionPreview: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  authorText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  questionsText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
