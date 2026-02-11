import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppContext } from '../../services/store';
import { Devotional } from '../../types';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

interface DayItem {
  date: string;
  devotional: Devotional | null;
}

export function BatchListScreen({ route, navigation }: any) {
  const { dates } = route.params as { dates: string[] };
  const { user, loadAllDevotionals } = useAppContext();
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const devos = await loadAllDevotionals();
    setAllDevotionals(devos);
    setLoading(false);
  }, [loadAllDevotionals]);

  useEffect(() => {
    refresh();
  }, []);

  // Re-fetch when returning from create screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);

  const devotionalsByDate = new Map<string, Devotional>();
  allDevotionals.forEach((d) => {
    const key = new Date(d.publishedAt).toISOString().split('T')[0];
    devotionalsByDate.set(key, d);
  });

  const dayItems: DayItem[] = dates.map((date) => ({
    date,
    devotional: devotionalsByDate.get(date) || null,
  }));

  const completedCount = dayItems.filter((d) => d.devotional !== null).length;
  const totalCount = dayItems.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const renderItem = ({ item, index }: { item: DayItem; index: number }) => (
    <TouchableOpacity
      style={styles.dayRow}
      onPress={() => {
        if (!item.devotional) {
          navigation.navigate('CreateDevotional', { date: item.date });
        }
      }}
      activeOpacity={item.devotional ? 1 : 0.6}
    >
      <View style={styles.dayLeft}>
        {item.devotional ? (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={14} color={colors.white} />
          </View>
        ) : (
          <View style={styles.emptyCircle}>
            <Text style={styles.emptyCircleText}>{index + 1}</Text>
          </View>
        )}
        <View style={styles.dayInfo}>
          <Text style={styles.dayDate}>{formatDateLabel(item.date)}</Text>
          {item.devotional ? (
            <Text style={styles.dayScripture} numberOfLines={1}>
              {item.devotional.scriptureRef} — {item.devotional.reflection.substring(0, 40)}...
            </Text>
          ) : (
            <Text style={styles.dayEmpty}>Tap to write</Text>
          )}
        </View>
      </View>
      {item.devotional ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.completedGreen} />
      ) : (
        <Ionicons name="create-outline" size={22} color={colors.secondary} />
      )}
    </TouchableOpacity>
  );

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const rangeLabel = `${formatDateLabel(firstDate)} — ${formatDateLabel(lastDate)}`;

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Batch Create" streakCount={user?.streakCount || 0} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Batch Create" streakCount={user?.streakCount || 0} />

      {/* Progress Header */}
      <View style={styles.progressCard}>
        <Text style={styles.rangeText}>{rangeLabel}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {completedCount} of {totalCount} completed
          </Text>
          <Text style={styles.progressPercent}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Day List */}
      <FlatList
        data={dayItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Button
          title={completedCount === totalCount ? 'All Done!' : `${completedCount}/${totalCount} Done`}
          onPress={() => navigation.navigate('ManageDevotionals')}
          disabled={completedCount === 0}
          style={styles.doneButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  rangeText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  progressPercent: {
    ...typography.bodyBold,
    color: colors.secondary,
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.completedGreen,
    borderRadius: 3,
  },
  listContent: {
    padding: spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.completedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircleText: {
    ...typography.small,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  dayScripture: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dayEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  separator: {
    height: spacing.sm,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  doneButton: {
    backgroundColor: colors.primary,
  },
});
