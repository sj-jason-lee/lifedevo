import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card } from '../../components/Card';
import { ReactionBar } from '../../components/ReactionBar';
import { AppHeader } from '../../components/AppHeader';
import { useAppContext } from '../../services/store';
import { SharedReflection, Prayer } from '../../types';

type TabType = 'reflections' | 'prayers';

export function CommunityScreen() {
  const { user, sharedReflections, prayers, church } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('reflections');

  const sharedPrayers = prayers.filter((p) => p.isShared && p.isRequest);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const renderReflection = ({ item }: { item: SharedReflection }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.scriptureRefBadge}>
        <Ionicons name="book-outline" size={12} color={colors.primary} />
        <Text style={styles.scriptureRefText}>{item.scriptureRef}</Text>
      </View>
      <Text style={styles.contentText}>{item.content}</Text>
      <ReactionBar reactions={item.reactions} />
    </Card>
  );

  const renderPrayerRequest = ({ item }: { item: Prayer }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, styles.prayerAvatar]}>
          <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        {item.isAnswered && (
          <View style={styles.answeredBadge}>
            <Ionicons name="checkmark-done" size={14} color={colors.success} />
            <Text style={styles.answeredText}>Answered</Text>
          </View>
        )}
      </View>
      <Text style={styles.contentText}>{item.content}</Text>
      <View style={styles.prayerFooter}>
        <TouchableOpacity style={styles.prayingButton} activeOpacity={0.7}>
          <Ionicons name="hand-left-outline" size={16} color={colors.prayerBlue} />
          <Text style={styles.prayingButtonText}>
            Praying{item.prayingCount > 0 ? ` (${item.prayingCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Community" streakCount={user?.streakCount || 0} churchName={church?.name} />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reflections' && styles.activeTab]}
          onPress={() => setActiveTab('reflections')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color={activeTab === 'reflections' ? colors.primary : colors.textTertiary}
          />
          <Text
            style={[styles.tabText, activeTab === 'reflections' && styles.activeTabText]}
          >
            Reflections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prayers' && styles.activeTab]}
          onPress={() => setActiveTab('prayers')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="hand-left-outline"
            size={18}
            color={activeTab === 'prayers' ? colors.prayerBlue : colors.textTertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'prayers' && styles.activeTabText,
              activeTab === 'prayers' && { color: colors.prayerBlue },
            ]}
          >
            Prayer Wall
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'reflections' ? (
        <FlatList
          data={sharedReflections}
          renderItem={renderReflection}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.borderLight} />
              <Text style={styles.emptyTitle}>No Shared Reflections Yet</Text>
              <Text style={styles.emptyMessage}>
                When members share their devotional reflections, they'll appear here.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={sharedPrayers}
          renderItem={renderPrayerRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="hand-left-outline" size={48} color={colors.borderLight} />
              <Text style={styles.emptyTitle}>No Prayer Requests Yet</Text>
              <Text style={styles.emptyMessage}>
                When members share prayer requests, they'll appear here so you can lift them up in prayer.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  activeTab: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  activeTabText: {
    color: colors.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerAvatar: {
    backgroundColor: colors.prayerBlue,
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 15,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  timeText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  scriptureRefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  scriptureRefText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  contentText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  prayerFooter: {
    marginTop: spacing.md,
  },
  prayingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F0F4F8',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  prayingButtonText: {
    ...typography.captionBold,
    color: colors.prayerBlue,
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  answeredText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
