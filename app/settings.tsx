import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Colors } from '../constants/colors';
import { FontFamily, TypeScale } from '../constants/typography';
import { Config } from '../constants/config';
import { GradientCard } from '../components/ui/GradientCard';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../components/ui/NoiseOverlay';
import { useFadeIn } from '../hooks/useFadeIn';
import { useOnboarding } from '../lib/OnboardingContext';
import { useAuth } from '../lib/AuthContext';
import { useChurch } from '../hooks/useChurch';
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  cancelDailyReminder,
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from '../lib/notifications';

// --- Editable Row ---

interface EditableRowProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
}

const EditableRow = ({
  label,
  value,
  onSave,
  autoCapitalize = 'words',
  placeholder,
}: EditableRowProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const borderProgress = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ['transparent', Colors.accent]
    ),
  }));

  const handleEdit = () => {
    setDraft(value);
    setEditing(true);
    borderProgress.value = withTiming(1, { duration: 300 });
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== value) {
      onSave(autoCapitalize === 'characters' ? trimmed.toUpperCase() : trimmed);
    }
    setEditing(false);
    borderProgress.value = withTiming(0, { duration: 300 });
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
    borderProgress.value = withTiming(0, { duration: 300 });
  };

  return (
    <View style={styles.rowContainer}>
      <Text style={styles.rowLabel}>{label}</Text>
      {editing ? (
        <Animated.View style={[styles.editContainer, borderStyle]}>
          <TextInput
            style={styles.editInput}
            value={draft}
            onChangeText={setDraft}
            autoCapitalize={autoCapitalize}
            autoFocus
            onSubmitEditing={handleSave}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
          />
          <View style={styles.editActions}>
            <AnimatedPressable onPress={handleSave} style={styles.editActionBtn}>
              <Feather name="check" size={18} color={Colors.accent} />
            </AnimatedPressable>
            <AnimatedPressable onPress={handleCancel} style={styles.editActionBtn}>
              <Feather name="x" size={18} color={Colors.textMuted} />
            </AnimatedPressable>
          </View>
        </Animated.View>
      ) : (
        <AnimatedPressable onPress={handleEdit} style={styles.valueRow}>
          <Text style={styles.rowValue} numberOfLines={1}>
            {value || placeholder}
          </Text>
          <Feather name="edit-2" size={16} color={Colors.textMuted} />
        </AnimatedPressable>
      )}
    </View>
  );
};

// --- Read-Only Row ---

interface ReadOnlyRowProps {
  label: string;
  value: string;
}

const ReadOnlyRow = ({ label, value }: ReadOnlyRowProps) => (
  <View style={styles.rowContainer}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValueReadOnly} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

// --- Time Input ---

interface TimeInputProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

const TimeInput = ({ hour, minute, onChange }: TimeInputProps) => {
  const [hourText, setHourText] = useState(String(hour).padStart(2, '0'));
  const [minuteText, setMinuteText] = useState(String(minute).padStart(2, '0'));

  const handleHourBlur = () => {
    const h = Math.min(23, Math.max(0, parseInt(hourText, 10) || 0));
    setHourText(String(h).padStart(2, '0'));
    onChange(h, parseInt(minuteText, 10) || 0);
  };

  const handleMinuteBlur = () => {
    const m = Math.min(59, Math.max(0, parseInt(minuteText, 10) || 0));
    setMinuteText(String(m).padStart(2, '0'));
    onChange(parseInt(hourText, 10) || 0, m);
  };

  return (
    <View style={styles.timeInputRow}>
      <Text style={styles.rowLabel}>Reminder Time</Text>
      <View style={styles.timeInputGroup}>
        <TextInput
          style={styles.timeInput}
          value={hourText}
          onChangeText={setHourText}
          onBlur={handleHourBlur}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
        <Text style={styles.timeColon}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={minuteText}
          onChangeText={setMinuteText}
          onBlur={handleMinuteBlur}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
      </View>
    </View>
  );
};

// --- Main Screen ---

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { userName, churchCode, setUserName, setChurchCode } = useOnboarding();
  const { user, signOut } = useAuth();
  const { church } = useChurch();

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 7,
    minute: 0,
  });

  // Load notification settings
  useEffect(() => {
    getNotificationSettings().then(setNotifSettings);
  }, []);

  const handleToggleReminder = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const token = await registerForPushNotifications();
        if (token === null && Platform.OS !== 'web') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive daily reminders.'
          );
          return;
        }
        await scheduleDailyReminder(notifSettings.hour, notifSettings.minute);
      } else {
        await cancelDailyReminder();
      }
      const updated = { ...notifSettings, enabled };
      setNotifSettings(updated);
      await saveNotificationSettings(updated.enabled, updated.hour, updated.minute);
    },
    [notifSettings]
  );

  const handleTimeChange = useCallback(
    async (hour: number, minute: number) => {
      const updated = { ...notifSettings, hour, minute };
      setNotifSettings(updated);
      await saveNotificationSettings(updated.enabled, hour, minute);
      if (updated.enabled) {
        await scheduleDailyReminder(hour, minute);
      }
    },
    [notifSettings]
  );

  const handleSignOut = useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await cancelDailyReminder();
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

  // Staggered fade-in animations
  const headerFade = useFadeIn(0);
  const accountFade = useFadeIn(Config.animation.stagger.card);
  const notifFade = useFadeIn(Config.animation.stagger.card * 2);
  const aboutFade = useFadeIn(Config.animation.stagger.card * 3);
  const actionsFade = useFadeIn(Config.animation.stagger.card * 4);

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View style={headerFade}>
          <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.headerLabel}>PREFERENCES</Text>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Account Section */}
        <Animated.View style={accountFade}>
          <Text style={styles.sectionHeading}>Account</Text>
          <GradientCard style={styles.sectionCard}>
            <ReadOnlyRow label="EMAIL" value={user?.email ?? '—'} />
            <View style={styles.rowDivider} />
            <EditableRow
              label="DISPLAY NAME"
              value={userName}
              onSave={setUserName}
              autoCapitalize="words"
              placeholder="Enter your name"
            />
            <View style={styles.rowDivider} />
            {church ? (
              <View style={styles.rowContainer}>
                <Text style={styles.rowLabel}>CHURCH</Text>
                <AnimatedPressable
                  onPress={() => router.push('/church')}
                  style={styles.valueRow}
                >
                  <Text style={styles.rowValue} numberOfLines={1}>
                    {church.name}
                  </Text>
                  <Text style={styles.manageLink}>Manage</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                </AnimatedPressable>
              </View>
            ) : (
              <EditableRow
                label="CHURCH CODE"
                value={churchCode}
                onSave={setChurchCode}
                autoCapitalize="characters"
                placeholder="Enter code"
              />
            )}
          </GradientCard>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View style={notifFade}>
          <Text style={styles.sectionHeading}>Notifications</Text>
          <GradientCard style={styles.sectionCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabelGroup}>
                <Text style={styles.switchLabel}>Daily Reminder</Text>
                <Text style={styles.switchCaption}>
                  Get reminded to read each day
                </Text>
              </View>
              <Switch
                value={notifSettings.enabled}
                onValueChange={handleToggleReminder}
                trackColor={{
                  false: Colors.surfaceMuted,
                  true: Colors.accentDim,
                }}
                thumbColor={notifSettings.enabled ? Colors.accent : Colors.textMuted}
              />
            </View>
            {notifSettings.enabled && (
              <>
                <View style={styles.rowDivider} />
                <TimeInput
                  hour={notifSettings.hour}
                  minute={notifSettings.minute}
                  onChange={handleTimeChange}
                />
              </>
            )}
          </GradientCard>
        </Animated.View>

        {/* About Section */}
        <Animated.View style={aboutFade}>
          <Text style={styles.sectionHeading}>About</Text>
          <GradientCard style={styles.sectionCard}>
            <ReadOnlyRow label="APP" value={Config.appName} />
            <View style={styles.rowDivider} />
            <ReadOnlyRow label="VERSION" value={appVersion} />
          </GradientCard>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View style={[styles.actionsSection, actionsFade]}>
          <AnimatedPressable style={styles.signOutButton} onPress={handleSignOut}>
            <Feather name="log-out" size={18} color={Colors.accent} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },

  // Back button
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 4,
  },

  // Header
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

  // Section
  sectionHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginTop: Config.spacing.sectionGap,
    marginBottom: 16,
  },
  sectionCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  // Row
  rowContainer: {
    paddingVertical: 12,
  },
  rowLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  rowValue: {
    ...TypeScale.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  rowValueReadOnly: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  manageLink: {
    ...TypeScale.monoLabel,
    color: Colors.accent,
    marginRight: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Edit mode
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Config.radius.sm,
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 12,
  },
  editInput: {
    ...TypeScale.body,
    color: Colors.textPrimary,
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editActionBtn: {
    padding: 6,
  },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabelGroup: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    ...TypeScale.bodyMedium,
    color: Colors.textPrimary,
  },
  switchCaption: {
    ...TypeScale.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Time input
  timeInputRow: {
    paddingVertical: 12,
  },
  timeInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeInput: {
    fontFamily: FontFamily.mono,
    fontSize: 20,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Config.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textAlign: 'center',
    minWidth: 52,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeColon: {
    fontFamily: FontFamily.mono,
    fontSize: 20,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },

  // Sign out
  actionsSection: {
    marginTop: Config.spacing.sectionGap,
    alignItems: 'center',
    paddingBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    backgroundColor: Colors.surfaceCard,
  },
  signOutText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.accent,
  },
});
