import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../../theme";
import { Card } from "../../components/Card";
import { AppHeader } from "../../components/AppHeader";
import { Button } from "../../components/Button";
import { useAppContext } from "../../services/store";
import { Prayer, JournalEntry } from "../../types";

type TabType = "overview" | "journal" | "prayers";

const MILESTONES = [7, 30, 100, 365];

export function MyJourneyScreen() {
  const {
    user,
    completions,
    journalEntries,
    prayers,
    devotionals,
    getUserPrayers,
    togglePrayerAnswered,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const userPrayers = getUserPrayers();
  const userJournals = journalEntries.filter((j) => j.userId === user?.id);

  const nextMilestone =
    MILESTONES.find((m) => m > (user?.streakCount || 0)) || 365;
  const prevMilestone =
    [...MILESTONES].reverse().find((m) => m <= (user?.streakCount || 0)) || 0;

  const getDevotionalRef = (devotionalId: string) => {
    const dev = devotionals.find((d) => d.id === devotionalId);
    return dev?.scriptureRef || "Unknown";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderOverview = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Streak Section */}
      <Card style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={32} color={colors.streak} />
          <View>
            <Text style={styles.streakCount}>
              {user?.streakCount || 0} Days
            </Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
        </View>
        <View style={styles.streakProgressBar}>
          <View
            style={[
              styles.streakProgressFill,
              {
                width: `${Math.min(
                  (((user?.streakCount || 0) - prevMilestone) /
                    (nextMilestone - prevMilestone)) *
                    100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.milestoneText}>
          {nextMilestone - (user?.streakCount || 0)} days until {nextMilestone}
          -day milestone
        </Text>
      </Card>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{completions.length}</Text>
          <Text style={styles.statLabel}>Devotionals{"\n"}Completed</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="pencil-outline" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{userJournals.length}</Text>
          <Text style={styles.statLabel}>Journal{"\n"}Entries</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons
            name="hand-left-outline"
            size={24}
            color={colors.prayerBlue}
          />
          <Text style={styles.statNumber}>{userPrayers.length}</Text>
          <Text style={styles.statLabel}>Prayers{"\n"}Written</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="trophy-outline" size={24} color={colors.secondary} />
          <Text style={styles.statNumber}>{user?.longestStreak || 0}</Text>
          <Text style={styles.statLabel}>Longest{"\n"}Streak</Text>
        </Card>
      </View>

      {/* Milestones */}
      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestoneRow}>
          {MILESTONES.map((milestone) => {
            const reached = (user?.streakCount || 0) >= milestone;
            return (
              <View
                key={milestone}
                style={[
                  styles.milestoneItem,
                  reached && styles.milestoneReached,
                ]}
              >
                <Ionicons
                  name={reached ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={reached ? colors.success : colors.borderLight}
                />
                <Text
                  style={[
                    styles.milestoneNumber,
                    reached && styles.milestoneNumberReached,
                  ]}
                >
                  {milestone}
                </Text>
                <Text style={styles.milestoneDays}>days</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderJournal = () => (
    <FlatList
      data={userJournals.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )}
      renderItem={({ item }: { item: JournalEntry }) => (
        <Card style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={styles.scriptureRefBadge}>
              <Ionicons name="book-outline" size={12} color={colors.primary} />
              <Text style={styles.scriptureRefText}>
                {getDevotionalRef(item.devotionalId)}
              </Text>
            </View>
            <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.entryContent}>{item.content}</Text>
          {item.isShared && (
            <View style={styles.sharedBadge}>
              <Ionicons
                name="people-outline"
                size={12}
                color={colors.textTertiary}
              />
              <Text style={styles.sharedText}>Shared with community</Text>
            </View>
          )}
        </Card>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons
            name="pencil-outline"
            size={48}
            color={colors.borderLight}
          />
          <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
          <Text style={styles.emptyMessage}>
            Start journaling during your daily devotionals to build a record of
            your spiritual journey.
          </Text>
        </View>
      }
    />
  );

  const renderPrayers = () => (
    <FlatList
      data={userPrayers.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )}
      renderItem={({ item }: { item: Prayer }) => (
        <Card style={[styles.entryCard, styles.prayerCard]}>
          <View style={styles.entryHeader}>
            <View style={[styles.scriptureRefBadge, styles.prayerRefBadge]}>
              <Ionicons
                name="book-outline"
                size={12}
                color={colors.prayerBlue}
              />
              <Text
                style={[styles.scriptureRefText, { color: colors.prayerBlue }]}
              >
                {getDevotionalRef(item.devotionalId)}
              </Text>
            </View>
            <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.prayerContent}>{item.content}</Text>
          <View style={styles.prayerFooter}>
            <TouchableOpacity
              style={[
                styles.answeredButton,
                item.isAnswered && styles.answeredButtonActive,
              ]}
              onPress={() => togglePrayerAnswered(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.isAnswered ? "checkmark-done" : "ellipse-outline"}
                size={16}
                color={item.isAnswered ? colors.success : colors.textTertiary}
              />
              <Text
                style={[
                  styles.answeredButtonText,
                  item.isAnswered && styles.answeredButtonTextActive,
                ]}
              >
                {item.isAnswered ? "Answered!" : "Mark as Answered"}
              </Text>
            </TouchableOpacity>
            {item.prayingCount > 0 && (
              <Text style={styles.prayingCountText}>
                {item.prayingCount} praying
              </Text>
            )}
          </View>
        </Card>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons
            name="hand-left-outline"
            size={48}
            color={colors.borderLight}
          />
          <Text style={styles.emptyTitle}>No Prayers Yet</Text>
          <Text style={styles.emptyMessage}>
            Write prayers during your devotional time to keep a record of how
            God is working in your life.
          </Text>
        </View>
      }
    />
  );

  return (
    <View style={styles.container}>
      <AppHeader subtitle="My Journey" streakCount={user?.streakCount || 0} />
      <View style={styles.tabBar}>
        {(["overview", "journal", "prayers"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "overview"
                ? "Overview"
                : tab === "journal"
                ? "Journal"
                : "Prayers"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === "overview" && renderOverview()}
      {activeTab === "journal" && renderJournal()}
      {activeTab === "prayers" && renderPrayers()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  activeTabText: {
    color: colors.white,
  },
  tabContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  streakCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  streakCount: {
    ...typography.title,
    color: colors.streak,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  streakProgressBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  streakProgressFill: {
    height: "100%",
    backgroundColor: colors.streak,
    borderRadius: 4,
  },
  milestoneText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "40%",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.title,
    color: colors.text,
  },
  statLabel: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: "center",
  },
  milestonesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  milestoneItem: {
    alignItems: "center",
    gap: 2,
    opacity: 0.4,
  },
  milestoneReached: {
    opacity: 1,
  },
  milestoneNumber: {
    ...typography.bodyBold,
    color: colors.textTertiary,
  },
  milestoneNumberReached: {
    color: colors.success,
  },
  milestoneDays: {
    ...typography.small,
    color: colors.textTertiary,
  },
  separator: {
    height: spacing.md,
  },
  entryCard: {
    padding: spacing.lg,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  scriptureRefBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  prayerRefBadge: {
    backgroundColor: "#F0F4F8",
  },
  scriptureRefText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "500",
  },
  entryDate: {
    ...typography.small,
    color: colors.textTertiary,
  },
  entryContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  sharedText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  prayerCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.prayerBlue,
  },
  prayerContent: {
    ...typography.body,
    color: colors.text,
    fontStyle: "italic",
    lineHeight: 24,
  },
  prayerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  answeredButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
  },
  answeredButtonActive: {
    backgroundColor: "#E8F5E9",
  },
  answeredButtonText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  answeredButtonTextActive: {
    color: colors.success,
    fontWeight: "600",
  },
  prayingCountText: {
    ...typography.small,
    color: colors.prayerBlue,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
