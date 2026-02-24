import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
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

interface AdminCardProps {
  devotional: DevotionalRow;
  index: number;
  onDelete: (id: string) => void;
}

const AdminDevotionalCard = ({ devotional, index, onDelete }: AdminCardProps) => {
  const fadeStyle = useFadeIn(Config.animation.stagger.card * (index + 2));

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
            </View>
            <View style={styles.cardActions}>
              <AnimatedPressable
                style={styles.deleteButton}
                onPress={() => onDelete(devotional.id)}
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
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { church, isLoading: churchLoading } = useChurch();
  const churchId = churchLoading ? undefined : church?.id ?? null;
  const { devotionals, isLoading, filter, setFilter, deleteDevotional } = useAdminDevotionals(churchId);
  const headerFade = useFadeIn(0);
  const ctaFade = useFadeIn(Config.animation.stagger.card);

  const showNoChurch = !churchLoading && !church;

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <ScrollView
        showsVerticalScrollIndicator={false}
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
          </View>
          <Text style={styles.headerLabel}>ADMIN</Text>
          <Text style={styles.headerTitle}>Devotionals</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {showNoChurch ? (
          /* No-church guard */
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
        ) : (
          <>
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

            {/* List */}
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
            ) : devotionals.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyText}>
                  {filter === 'all' ? 'No devotionals yet' : `No ${filter} devotionals`}
                </Text>
              </View>
            ) : (
              devotionals.map((devo, i) => (
                <AdminDevotionalCard
                  key={devo.id}
                  devotional={devo}
                  index={i}
                  onDelete={deleteDevotional}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
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
