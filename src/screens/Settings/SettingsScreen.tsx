import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AppHeader } from '../../components/AppHeader';
import { useAppContext } from '../../services/store';

export function SettingsScreen() {
  const { user, church, logout, leaveChurch } = useAppContext();
  const [dailyNotifications, setDailyNotifications] = useState(true);
  const [communityNotifications, setCommunityNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleShareInvite = async () => {
    if (!church?.inviteCode) return;
    try {
      await Share.share({
        message: `Join ${church.name} on Life Devo! Use invite code: ${church.inviteCode}`,
      });
    } catch (e) {
      // user cancelled
    }
  };

  const handleLeaveChurch = () => {
    Alert.alert(
      'Leave Church',
      `Are you sure you want to leave ${church?.name}? You can rejoin with the invite code later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: leaveChurch },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Settings" streakCount={user?.streakCount || 0} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name.charAt(0) || '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role || 'member'}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Church Section */}
        <Text style={styles.sectionTitle}>Church</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.settingLabel}>{church?.name || 'No Church'}</Text>
                <Text style={styles.settingDesc}>
                  {church?.memberCount || 0} members
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleShareInvite}>
            <View style={styles.settingLeft}>
              <Ionicons name="key-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Invite Code</Text>
                <Text style={styles.settingDesc}>{church?.inviteCode || '---'}</Text>
              </View>
            </View>
            <Ionicons name="share-outline" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={handleLeaveChurch}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>Leave Church</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Daily Devotional</Text>
                <Text style={styles.settingDesc}>Get notified when new devotionals are posted</Text>
              </View>
            </View>
            <Switch
              value={dailyNotifications}
              onValueChange={setDailyNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={dailyNotifications ? colors.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flame-outline" size={20} color={colors.streak} />
              <View>
                <Text style={styles.settingLabel}>Streak Reminders</Text>
                <Text style={styles.settingDesc}>Gentle reminder if you haven't read today</Text>
              </View>
            </View>
            <Switch
              value={streakReminders}
              onValueChange={setStreakReminders}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={streakReminders ? colors.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={20} color={colors.prayerBlue} />
              <View>
                <Text style={styles.settingLabel}>Community Activity</Text>
                <Text style={styles.settingDesc}>Prayer reactions and new prayer requests</Text>
              </View>
            </View>
            <Switch
              value={communityNotifications}
              onValueChange={setCommunityNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={communityNotifications ? colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* Notification Time */}
        <Text style={styles.sectionTitle}>Reminder Time</Text>
        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Daily Reminder</Text>
                <Text style={styles.settingDesc}>Currently set to {user?.notificationTime || '7:00 AM'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Privacy Section */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Default Sharing</Text>
                <Text style={styles.settingDesc}>Journal entries are private by default</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={20} color={colors.primary} />
              <View>
                <Text style={styles.settingLabel}>Export My Data</Text>
                <Text style={styles.settingDesc}>Download your journals and prayers</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.sectionCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textTertiary} />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.signOutButton}
          textStyle={{ color: colors.error }}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.title,
    color: colors.white,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    ...typography.subtitle,
    color: colors.text,
  },
  profileEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  roleText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionCard: {
    padding: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  settingDesc: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 1,
  },
  settingValue: {
    ...typography.body,
    color: colors.textTertiary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.lg,
    borderColor: colors.error,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
