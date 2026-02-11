import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppContext } from '../../services/store';
import { Devotional } from '../../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= count; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

export function ManageDevotionalsScreen({ navigation }: any) {
  const { user, loadAllDevotionals } = useAppContext();
  const [allDevotionals, setAllDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    const devos = await loadAllDevotionals();
    setAllDevotionals(devos);
    setLoading(false);
  }, [loadAllDevotionals]);

  useEffect(() => {
    refresh();
  }, []);

  // Re-fetch when screen is focused (coming back from create)
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

  const days = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDayOfWeek = days[0].getDay();
  const today = toDateKey(new Date());

  const scheduledCount = allDevotionals.length;
  const totalDays = days.length;
  const monthDevos = allDevotionals.filter((d) => {
    const dt = new Date(d.publishedAt);
    return dt.getFullYear() === currentMonth.year && dt.getMonth() === currentMonth.month;
  });

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  // Build upcoming list (next 14 days from today)
  const upcoming: { date: string; label: string; devotional: Devotional | null }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    upcoming.push({ date: key, label, devotional: devotionalsByDate.get(key) || null });
  }

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Manage Devotionals" streakCount={user?.streakCount || 0} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar */}
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {MONTHS[currentMonth.month]} {currentMonth.year}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((w) => (
                <Text key={w} style={styles.weekdayLabel}>{w}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {days.map((day) => {
                const key = toDateKey(day);
                const hasDevo = devotionalsByDate.has(key);
                const isToday = key === today;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.dayCell, isToday && styles.todayCell]}
                    onPress={() => {
                      if (!hasDevo) {
                        navigation.navigate('CreateDevotional', { date: key });
                      }
                    }}
                    activeOpacity={hasDevo ? 1 : 0.6}
                  >
                    <Text style={[
                      styles.dayNumber,
                      isToday && styles.todayNumber,
                      hasDevo && styles.scheduledDayNumber,
                    ]}>
                      {day.getDate()}
                    </Text>
                    {hasDevo ? (
                      <View style={styles.dotFilled} />
                    ) : (
                      <View style={styles.dotEmpty} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.dotFilled} />
                <Text style={styles.legendText}>Scheduled</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.dotEmpty} />
                <Text style={styles.legendText}>Empty</Text>
              </View>
            </View>

            <Text style={styles.monthSummary}>
              {monthDevos.length} of {totalDays} days scheduled this month
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Button
              title="+ Single"
              onPress={() => navigation.navigate('CreateDevotional')}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="+ Batch Create"
              onPress={() => navigation.navigate('BatchSetup')}
              style={styles.actionButton}
            />
          </View>

          {/* Upcoming */}
          <Text style={styles.sectionTitle}>UPCOMING</Text>
          <View style={styles.upcomingCard}>
            {upcoming.map((item, index) => (
              <React.Fragment key={item.date}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.upcomingRow}
                  onPress={() => {
                    if (!item.devotional) {
                      navigation.navigate('CreateDevotional', { date: item.date });
                    }
                  }}
                  activeOpacity={item.devotional ? 1 : 0.6}
                >
                  <View style={styles.upcomingLeft}>
                    {item.devotional ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.completedGreen} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color={colors.textMuted} />
                    )}
                    <View style={styles.upcomingInfo}>
                      <Text style={styles.upcomingLabel}>{item.label}</Text>
                      {item.devotional ? (
                        <Text style={styles.upcomingScripture} numberOfLines={1}>
                          {item.devotional.scriptureRef}
                        </Text>
                      ) : (
                        <Text style={styles.upcomingEmpty}>No devotional</Text>
                      )}
                    </View>
                  </View>
                  {!item.devotional && (
                    <View style={styles.addBadge}>
                      <Text style={styles.addBadgeText}>+ Add</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
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
  scrollContent: {
    padding: spacing.lg,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  calendarTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  todayCell: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
  },
  dayNumber: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  todayNumber: {
    fontWeight: '700',
    color: colors.primary,
  },
  scheduledDayNumber: {
    fontWeight: '600',
  },
  dotFilled: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.completedGreen,
    marginTop: 2,
  },
  dotEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  monthSummary: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  upcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingLabel: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  upcomingScripture: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  upcomingEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  addBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  addBadgeText: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
});
