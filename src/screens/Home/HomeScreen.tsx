import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserMemberships, joinGroupByCode } from '../../services/groupService';
import { colors, fonts, spacing } from '../../theme';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/* ── Join Group Card (inline component) ── */

function JoinGroupCard({ onJoined, userId }: { onJoined: () => void; userId: string }) {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      showToast({ message: 'Please enter an invite code.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const group = await joinGroupByCode(userId, trimmed);
      showToast({ message: `Joined "${group.name}"!`, type: 'success' });
      onJoined();
    } catch (e: any) {
      showToast({ message: e.message ?? 'Failed to join group.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.joinCard}>
      <View style={styles.joinIconCircle}>
        <Ionicons name="people-outline" size={24} color={colors.green} />
      </View>
      <Text style={styles.joinHeadline}>Join a group</Text>
      <Text style={styles.joinSubtitle}>
        Enter the invite code your shepherd shared with you.
      </Text>
      <TextInput
        style={styles.codeInput}
        placeholder="FLOCK-XXXX"
        placeholderTextColor={colors.border}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!submitting}
        maxLength={10}
      />
      <TouchableOpacity
        style={[styles.joinBtn, submitting && styles.disabled]}
        activeOpacity={0.85}
        onPress={handleJoin}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.joinBtnText}>Join Group</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* ── Home Screen ── */

export default function HomeScreen() {
  const { user, userProfile, signOut, resetOnboarding } = useAuth();
  const navigation = useNavigation();
  const firstName = (userProfile?.displayName ?? 'Friend').split(' ')[0];

  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  // 4 animation slots: header, devotional, join-card, footer
  const anims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;

  const row = (index: number, child: React.ReactNode) => (
    <Animated.View
      key={index}
      style={{
        opacity: anims[index],
        transform: [
          {
            translateY: anims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
      }}
    >
      {child}
    </Animated.View>
  );

  // Phase 1: fade in header immediately
  useEffect(() => {
    Animated.timing(anims[0], {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Membership check
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const memberships = await getUserMemberships(user.uid);
        if (!cancelled) setHasGroup(memberships.length > 0);
      } catch {
        if (!cancelled) setHasGroup(false);
      } finally {
        if (!cancelled) setMembershipLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Phase 2: stagger remaining cards after membership check resolves
  useEffect(() => {
    if (membershipLoading) return;
    Animated.stagger(
      100,
      anims.slice(1).map((a) =>
        Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true }),
      ),
    ).start();
  }, [membershipLoading]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Section A: Header */}
          {row(
            0,
            <View style={styles.header}>
              <Text style={styles.brand}>pasture</Text>
              <Text style={styles.greeting}>
                {getGreeting()}, {firstName}
              </Text>
              <Text style={styles.date}>{getFormattedDate()}</Text>
            </View>,
          )}

          {/* Section B: Today's Devotional Card */}
          {row(
            1,
            <View style={styles.devoCard}>
              <View style={styles.devoPill}>
                <Text style={styles.devoPillText}>Today's Reading</Text>
              </View>
              <Text style={styles.devoReference}>1 Peter 5:10 (ESV)</Text>
              <Text style={styles.devoVerse}>
                And after you have suffered a little while, the God of all
                grace, who has called you to his eternal glory in Christ, will
                himself restore, confirm, strengthen, and establish you.
              </Text>
              <Text style={styles.devoBody}>
                It's amazing to see an old car or a home completely restored. It
                goes from appearing destroyed or useless to looking brand new.
                Doesn't the Lord do this with us? Most — if not all — of us go
                through spiritual highs and lows. In some seasons we struggle to
                feel God near to us. We may struggle to get into the Word or to
                pray. Often, these seasons coincide with difficult circumstances.
                God restores us completely when we come to Him for salvation, but
                He daily restores us too. He continually makes us new, and He
                restores us when we're weary.
              </Text>
              <Text style={styles.devoSectionLabel}>Reflect</Text>
              <Text style={styles.devoListItem}>
                1. What is making you weary right now?
              </Text>
              <Text style={styles.devoListItem}>
                2. What areas of your life are in need of God's restoring power?
              </Text>
              <Text style={styles.devoSectionLabel}>Pray</Text>
              <Text style={styles.devoBody}>
                Ask God to restore you — to make you new and refreshed. Thank
                the Lord for continuing to change you as you follow Him.
              </Text>
              <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>Start Reading</Text>
              </TouchableOpacity>
            </View>,
          )}

          {/* Section C: Join Group Prompt (conditional) */}
          {hasGroup === false &&
            row(
              2,
              <JoinGroupCard
                userId={user!.uid}
                onJoined={() => setHasGroup(true)}
              />,
            )}

          {/* Section D: Footer */}
          {row(
            3,
            <View style={styles.footer}>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.footerBtn}
                activeOpacity={0.7}
                onPress={signOut}
              >
                <Text style={styles.footerBtnText}>Sign Out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerBtn, { borderColor: colors.green }]}
                activeOpacity={0.7}
                onPress={async () => {
                  await resetOnboarding();
                  requestAnimationFrame(() => {
                    navigation.dispatch(
                      CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }),
                    );
                  });
                }}
              >
                <Text style={[styles.footerBtnText, { color: colors.green }]}>
                  DEV: Reset Onboarding
                </Text>
              </TouchableOpacity>
            </View>,
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  /* Header */
  header: {
    marginBottom: spacing.lg,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.green,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
  },

  /* Devotional Card */
  devoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  devoPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  devoPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.green,
  },
  devoReference: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  devoVerse: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  devoBody: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  devoSectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  devoListItem: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  startBtn: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.textInverse,
  },

  /* Join Group Card */
  joinCard: {
    backgroundColor: colors.greenLight,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  joinIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  joinHeadline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  joinSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  codeInput: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    width: '100%',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  joinBtn: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    width: '100%',
  },
  joinBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.6,
  },

  /* Footer */
  footer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  footerBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
