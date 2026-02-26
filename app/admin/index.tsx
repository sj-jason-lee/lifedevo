import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../../components/ui/GradientCard';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useAdminDevotionals } from '../../hooks/useAdminDevotionals';
import { useChurch } from '../../hooks/useChurch';
import type { DevotionalRow, DevotionalStatus } from '../../types';

const FILTERS: Array<{ label: string; value: DevotionalStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

const STATUS_COLORS: Record<DevotionalStatus, string> = {
  draft: Colors.textMuted,
  scheduled: '#5B8DEF',
  published: Colors.accent,
  archived: Colors.textMuted,
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface StatusAction {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  targetStatus: DevotionalStatus;
  variant: 'accent' | 'blue' | 'muted';
  confirm?: boolean;
}

const STATUS_ACTIONS: Record<DevotionalStatus, StatusAction[]> = {
  draft: [
    { label: 'Publish', icon: 'send', targetStatus: 'published', variant: 'accent' },
    { label: 'Schedule', icon: 'clock', targetStatus: 'scheduled', variant: 'blue' },
  ],
  scheduled: [
    { label: 'Publish Now', icon: 'send', targetStatus: 'published', variant: 'accent' },
    { label: 'Back to Draft', icon: 'edit-3', targetStatus: 'draft', variant: 'muted' },
  ],
  published: [
    { label: 'Archive', icon: 'archive', targetStatus: 'archived', variant: 'muted', confirm: true },
  ],
  archived: [
    { label: 'Republish', icon: 'send', targetStatus: 'published', variant: 'accent' },
    { label: 'Back to Draft', icon: 'edit-3', targetStatus: 'draft', variant: 'muted' },
  ],
};

const ACTION_COLORS: Record<StatusAction['variant'], { bg: string; text: string }> = {
  accent: { bg: Colors.accent + '20', text: Colors.accent },
  blue: { bg: '#5B8DEF20', text: '#5B8DEF' },
  muted: { bg: Colors.surfaceMuted, text: Colors.textMuted },
};

interface AdminCardProps {
  devotional: DevotionalRow;
  index: number;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: DevotionalStatus) => void;
}

const AdminDevotionalCard = React.memo(({ devotional, index, onDelete, onStatusChange }: AdminCardProps) => {
  const fadeStyle = useFadeIn(Config.animation.stagger.card * (index + 2));
  const actions = STATUS_ACTIONS[devotional.status];

  const handleAction = (action: StatusAction) => {
    if (action.confirm) {
      Alert.alert(
        `${action.label} Devotional`,
        `Are you sure you want to ${action.label.toLowerCase()} "${devotional.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: action.label,
            onPress: () => onStatusChange(devotional.id, action.targetStatus),
          },
        ]
      );
    } else {
      onStatusChange(devotional.id, action.targetStatus);
    }
  };

  return (
    <Animated.View style={[styles.cardSpacing, fadeStyle]}>
      <AnimatedPressable
        onPress={() => router.push(`/admin/edit?id=${devotional.id}`)}
      >
        <GradientCard style={styles.listCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardDate}>{formatDate(devotional.date)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[devotional.status] + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: STATUS_COLORS[devotional.status] }]}>
                    {devotional.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {devotional.title}
              </Text>
              <Text style={styles.cardMeta}>
                {devotional.scripture} · {devotional.author_name}
              </Text>
              {devotional.status === 'scheduled' && devotional.scheduled_date && (
                <View style={styles.scheduledRow}>
                  <Feather name="clock" size={12} color={STATUS_COLORS.scheduled} />
                  <Text style={styles.scheduledText}>
                    Publishes {new Date(devotional.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(devotional.scheduled_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </Text>
                </View>
              )}
              {/* Status Action Buttons */}
              <View style={styles.statusActions}>
                {actions.map((action) => {
                  const colors = ACTION_COLORS[action.variant];
                  return (
                    <AnimatedPressable
                      key={action.targetStatus}
                      style={[styles.statusActionPill, { backgroundColor: colors.bg }]}
                      onPress={() => handleAction(action)}
                    >
                      <Feather name={action.icon} size={12} color={colors.text} />
                      <Text style={[styles.statusActionText, { color: colors.text }]}>
                        {action.label}
                      </Text>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.cardActions}>
              <AnimatedPressable
                style={styles.deleteButton}
                onPress={() => onDelete(devotional.id)}
                accessibilityLabel="Delete devotional"
              >
                <Feather name="trash-2" size={16} color={Colors.textMuted} />
              </AnimatedPressable>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </View>
          </View>
        </GradientCard>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { church, isLoading: churchLoading } = useChurch();
  const churchId = churchLoading ? undefined : church?.id ?? null;
  const { devotionals, isLoading, error, filter, setFilter, refetch, deleteDevotional, updateStatus } = useAdminDevotionals(churchId);
  const headerFade = useFadeIn(0);
  const ctaFade = useFadeIn(Config.animation.stagger.card);

  const showNoChurch = !churchLoading && !church;

  const renderItem = useCallback(({ item, index }: { item: DevotionalRow; index: number }) => (
    <AdminDevotionalCard
      devotional={item}
      index={index}
      onDelete={deleteDevotional}
      onStatusChange={updateStatus}
    />
  ), [deleteDevotional, updateStatus]);

  const keyExtractor = useCallback((item: DevotionalRow) => item.id, []);

  const ListHeader = useMemo(() => (
    <>
      {/* Header */}
      <Animated.View style={headerFade}>
        <View style={styles.headerRow}>
          <AnimatedPressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
          </AnimatedPressable>
        </View>
        <Text style={styles.headerLabel}>ADMIN</Text>
        <Text style={styles.headerTitle}>Devotionals</Text>
        <View style={styles.accentLine} />
      </Animated.View>

      {/* Create New CTA */}
      <Animated.View style={[styles.ctaSection, ctaFade]}>
        <AnimatedPressable
          onPress={() => router.push('/admin/edit')}
        >
          <LinearGradient
            colors={[Colors.accent, '#B8972F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButton}
          >
            <Feather name="plus" size={20} color={Colors.textDark} />
            <Text style={styles.createButtonText}>Create New Devotional</Text>
          </LinearGradient>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.bulkImportButton}
          onPress={() => router.push('/admin/import')}
        >
          <Feather name="upload" size={18} color={Colors.textAccent} />
          <Text style={styles.bulkImportButtonText}>Bulk Import from CSV</Text>
        </AnimatedPressable>
      </Animated.View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <AnimatedPressable
            key={f.value}
            style={[
              styles.filterPill,
              filter === f.value && styles.filterPillActive,
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === f.value && styles.filterPillTextActive,
              ]}
            >
              {f.label}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </>
  ), [headerFade, ctaFade, filter, setFilter]);

  const ListEmpty = useMemo(() => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.errorState}>
          <Feather name="alert-circle" size={40} color={Colors.textMuted} />
          <Text style={styles.errorTitle}>Failed to load devotionals</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <AnimatedPressable style={styles.retryButton} onPress={refetch}>
            <Feather name="refresh-cw" size={16} color={Colors.textAccent} />
            <Text style={styles.retryText}>Retry</Text>
          </AnimatedPressable>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Feather name="inbox" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>
          {filter === 'all' ? 'No devotionals yet' : `No ${filter} devotionals`}
        </Text>
      </View>
    );
  }, [isLoading, error, filter, refetch]);

  if (showNoChurch) {
    return (
      <View style={styles.container}>
        <NoiseOverlay />
        <View style={[styles.scrollContent, { paddingTop: insets.top + 16 }]}>
          <Animated.View style={headerFade}>
            <View style={styles.headerRow}>
              <AnimatedPressable
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel="Go back"
              >
                <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
              </AnimatedPressable>
            </View>
            <Text style={styles.headerLabel}>ADMIN</Text>
            <Text style={styles.headerTitle}>Devotionals</Text>
            <View style={styles.accentLine} />
          </Animated.View>
          <View style={styles.noChurchState}>
            <Feather name="alert-circle" size={40} color={Colors.textMuted} />
            <Text style={styles.noChurchTitle}>No Church</Text>
            <Text style={styles.noChurchBody}>
              You need to be part of a church to manage devotionals.
            </Text>
            <AnimatedPressable
              style={styles.noChurchButton}
              onPress={() => router.push('/church')}
            >
              <Feather name="plus" size={16} color={Colors.textAccent} />
              <Text style={styles.noChurchButtonText}>Join or Create a Church</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <FlatList
        data={devotionals}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        initialNumToRender={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
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
    marginBottom: 8,
  },

  // Create CTA
  ctaSection: {
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Config.radius.md,
  },
  createButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  bulkImportButton: {
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
  bulkImportButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textAccent,
    letterSpacing: 0.5,
  },

  // Filters
  filterRow: {
    marginBottom: 20,
  },
  filterContent: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  filterPillActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  filterPillText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  filterPillTextActive: {
    color: Colors.textAccent,
  },

  // Cards
  cardSpacing: {
    marginBottom: 12,
  },
  listCard: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardDate: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  cardMeta: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  scheduledText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: '#5B8DEF',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  statusActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusActionText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading / Empty
  loader: {
    marginTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },
  errorState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  errorBody: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    marginTop: 8,
  },
  retryText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },

  // No church state
  noChurchState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
    paddingHorizontal: 20,
  },
  noChurchTitle: {
    fontSize: 22,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  noChurchBody: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  noChurchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    marginTop: 8,
  },
  noChurchButtonText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
});
