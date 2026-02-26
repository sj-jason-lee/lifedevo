import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../../components/ui/GradientCard';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useChurch } from '../../hooks/useChurch';
import { useAuth } from '../../lib/AuthContext';
import { useOnboarding } from '../../lib/OnboardingContext';

const AnimatedView = Animated.View;

export default function ChurchScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isAuthor, isAdmin } = useOnboarding();
  const {
    church,
    memberCount,
    isLeader,
    isLoading,
    createChurch,
    joinChurch,
    leaveChurch,
    updateChurch,
  } = useChurch();

  // Edit mode (creator only)
  const isCreator = !!(church && user && church.createdBy === user.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const editNameFocus = useSharedValue(0);
  const editDescFocus = useSharedValue(0);

  const editNameBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      editNameFocus.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  const editDescBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      editDescFocus.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  const handleStartEdit = () => {
    if (!church) return;
    setEditName(church.name);
    setEditDesc(church.description);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setEditLoading(true);
    const { error } = await updateChurch(editName, editDesc);
    setEditLoading(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      setIsEditing(false);
    }
  };

  // Join flow state
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const joinFocusProgress = useSharedValue(0);

  // Create flow state
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const createNameFocus = useSharedValue(0);
  const createDescFocus = useSharedValue(0);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Animations
  const headerFade = useFadeIn(0);
  const contentFade = useFadeIn(Config.animation.stagger.card);
  const actionsFade = useFadeIn(Config.animation.stagger.card * 2);

  const joinBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      joinFocusProgress.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  const createNameBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      createNameFocus.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  const createDescBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      createDescFocus.value,
      [0, 1],
      [Colors.border, Colors.accent]
    ),
  }));

  const handleCopy = async () => {
    if (!church) return;
    await Clipboard.setStringAsync(church.inviteCode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!church) return;
    await Share.share({
      message: `Join ${church.name} on Pasture! Use invite code: ${church.inviteCode}`,
    });
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    const { error } = await joinChurch(joinCode);
    setJoinLoading(false);
    if (error) {
      Alert.alert('Could not join', error);
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreateLoading(true);
    const { error } = await createChurch(createName, createDesc);
    setCreateLoading(false);
    if (error) {
      Alert.alert('Could not create', error);
    } else {
      setShowCreate(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Church',
      `Are you sure you want to leave ${church?.name}? You can rejoin later with the invite code.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const { error } = await leaveChurch();
            if (error) Alert.alert('Error', error);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // --- HAS CHURCH ---
  if (church) {
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
            <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
            </AnimatedPressable>
            <Text style={styles.monoLabel}>YOUR CHURCH</Text>
            {isEditing ? (
              <>
                <Text style={styles.editLabel}>Church Name</Text>
                <AnimatedView style={[styles.inputWrapper, editNameBorderStyle]}>
                  <TextInput
                    style={styles.createInput}
                    value={editName}
                    onChangeText={setEditName}
                    onFocus={() => { editNameFocus.value = withTiming(1, { duration: 250 }); }}
                    onBlur={() => { editNameFocus.value = withTiming(0, { duration: 250 }); }}
                    placeholder="Church name"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                  />
                </AnimatedView>
                <Text style={[styles.editLabel, { marginTop: 16 }]}>Description</Text>
                <AnimatedView style={[styles.inputWrapper, editDescBorderStyle]}>
                  <TextInput
                    style={[styles.createInput, styles.multilineInput]}
                    value={editDesc}
                    onChangeText={setEditDesc}
                    onFocus={() => { editDescFocus.value = withTiming(1, { duration: 250 }); }}
                    onBlur={() => { editDescFocus.value = withTiming(0, { duration: 250 }); }}
                    placeholder="A short description"
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </AnimatedView>
                <View style={styles.editActions}>
                  <AnimatedPressable
                    style={[styles.editSaveBtn, !editName.trim() && styles.btnDisabled]}
                    onPress={handleSaveEdit}
                    haptic={!!editName.trim()}
                  >
                    {editLoading ? (
                      <ActivityIndicator size="small" color={Colors.textDark} />
                    ) : (
                      <>
                        <Feather name="check" size={16} color={Colors.textDark} />
                        <Text style={styles.editSaveText}>Save</Text>
                      </>
                    )}
                  </AnimatedPressable>
                  <AnimatedPressable style={styles.editCancelBtn} onPress={handleCancelEdit}>
                    <Text style={styles.editCancelText}>Cancel</Text>
                  </AnimatedPressable>
                </View>
              </>
            ) : (
              <View style={styles.headingEditRow}>
                <Text style={styles.heading}>{church.name}</Text>
                {isCreator && (
                  <AnimatedPressable onPress={handleStartEdit} style={styles.editIconBtn}>
                    <Feather name="edit-2" size={18} color={Colors.textMuted} />
                  </AnimatedPressable>
                )}
              </View>
            )}
            <View style={styles.accentLine} />
          </Animated.View>

          {/* Invite Code Card */}
          <Animated.View style={contentFade}>
            <GradientCard style={styles.codeCard}>
              <Text style={styles.codeLabel}>INVITE CODE</Text>
              <Text style={styles.codeDisplay}>{church.inviteCode}</Text>
              <View style={styles.codeActions}>
                <AnimatedPressable
                  onPress={handleCopy}
                  style={styles.codeActionBtn}
                >
                  <Feather
                    name={copied ? 'check' : 'copy'}
                    size={18}
                    color={Colors.accent}
                  />
                  <Text style={styles.codeActionText}>
                    {copied ? 'Copied' : 'Copy'}
                  </Text>
                </AnimatedPressable>
                <View style={styles.codeDivider} />
                <AnimatedPressable
                  onPress={handleShare}
                  style={styles.codeActionBtn}
                >
                  <Feather name="share" size={18} color={Colors.accent} />
                  <Text style={styles.codeActionText}>Share</Text>
                </AnimatedPressable>
              </View>
            </GradientCard>
          </Animated.View>

          {/* Info Card */}
          <Animated.View style={[styles.infoSection, contentFade]}>
            {!isEditing && church.description ? (
              <GradientCard style={styles.infoCard}>
                <Text style={styles.descriptionText}>{church.description}</Text>
              </GradientCard>
            ) : null}

            <GradientCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MEMBERS</Text>
                <Text style={styles.infoValue}>{memberCount}</Text>
              </View>
            </GradientCard>

            {/* View Members */}
            <AnimatedPressable
              onPress={() => router.push('/church/members')}
              style={styles.memberNavButton}
            >
              <Feather name="users" size={18} color={Colors.accent} />
              <Text style={styles.memberNavText}>View Members</Text>
              <View style={styles.chevron}>
                <Feather name="chevron-right" size={18} color={Colors.textMuted} />
              </View>
            </AnimatedPressable>
          </Animated.View>

          {/* Leave Church */}
          <Animated.View style={[styles.leaveSection, actionsFade]}>
            <AnimatedPressable onPress={handleLeave} style={styles.leaveButton}>
              <Feather name="log-out" size={18} color={Colors.textMuted} />
              <Text style={styles.leaveText}>Leave Church</Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // --- NO CHURCH ---
  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
            <Text style={styles.monoLabel}>COMMUNITY</Text>
            <Text style={styles.heading}>Your Church</Text>
            <View style={styles.accentLine} />
          </Animated.View>

          {/* Empty state */}
          <Animated.View style={contentFade}>
            <GradientCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Not part of a church yet</Text>
              <Text style={styles.emptyBody}>
                Join a church with an invite code to connect with your community's
                reflections and devotionals.
              </Text>
            </GradientCard>
          </Animated.View>

          {/* Join section */}
          <Animated.View style={[styles.joinSection, contentFade]}>
            <Text style={styles.sectionHeading}>Join a Church</Text>
            <AnimatedView style={[styles.inputWrapper, joinBorderStyle]}>
              <TextInput
                style={styles.codeInput}
                value={joinCode}
                onChangeText={setJoinCode}
                onFocus={() => {
                  joinFocusProgress.value = withTiming(1, { duration: 250 });
                }}
                onBlur={() => {
                  joinFocusProgress.value = withTiming(0, { duration: 250 });
                }}
                placeholder="INVITE CODE"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="join"
                onSubmitEditing={handleJoin}
              />
            </AnimatedView>

            <AnimatedPressable
              style={[styles.joinButton, !joinCode.trim() && styles.btnDisabled]}
              onPress={handleJoin}
              haptic={!!joinCode.trim()}
            >
              <LinearGradient
                colors={[Colors.accent, '#B8972F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.joinGradient}
              >
                {joinLoading ? (
                  <ActivityIndicator size="small" color={Colors.textDark} />
                ) : (
                  <Text style={styles.joinButtonText}>Join</Text>
                )}
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>

          {/* Create section (authors/admins only) */}
          {(isAuthor || isAdmin) && !showCreate && (
            <Animated.View style={actionsFade}>
              <View style={styles.orDivider}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>
              <AnimatedPressable
                onPress={() => setShowCreate(true)}
                style={styles.createToggleButton}
              >
                <Feather name="plus" size={18} color={Colors.accent} />
                <Text style={styles.createToggleText}>Create a Church</Text>
              </AnimatedPressable>
            </Animated.View>
          )}

          {/* Create form */}
          {showCreate && (
            <Animated.View style={[styles.createSection, actionsFade]}>
              <View style={styles.orDivider}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR CREATE</Text>
                <View style={styles.orLine} />
              </View>

              <Text style={styles.createLabel}>Church Name</Text>
              <AnimatedView style={[styles.inputWrapper, createNameBorderStyle]}>
                <TextInput
                  style={styles.createInput}
                  value={createName}
                  onChangeText={setCreateName}
                  onFocus={() => {
                    createNameFocus.value = withTiming(1, { duration: 250 });
                  }}
                  onBlur={() => {
                    createNameFocus.value = withTiming(0, { duration: 250 });
                  }}
                  placeholder="e.g. Grace Community"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </AnimatedView>

              <Text style={[styles.createLabel, { marginTop: 16 }]}>
                Description (optional)
              </Text>
              <AnimatedView style={[styles.inputWrapper, createDescBorderStyle]}>
                <TextInput
                  style={[styles.createInput, styles.multilineInput]}
                  value={createDesc}
                  onChangeText={setCreateDesc}
                  onFocus={() => {
                    createDescFocus.value = withTiming(1, { duration: 250 });
                  }}
                  onBlur={() => {
                    createDescFocus.value = withTiming(0, { duration: 250 });
                  }}
                  placeholder="A short description of your church"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </AnimatedView>

              <AnimatedPressable
                style={[
                  styles.joinButton,
                  { marginTop: 20 },
                  !createName.trim() && styles.btnDisabled,
                ]}
                onPress={handleCreate}
                haptic={!!createName.trim()}
              >
                <LinearGradient
                  colors={[Colors.accent, '#B8972F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.joinGradient}
                >
                  {createLoading ? (
                    <ActivityIndicator size="small" color={Colors.textDark} />
                  ) : (
                    <Text style={styles.joinButtonText}>Create Church</Text>
                  )}
                </LinearGradient>
              </AnimatedPressable>

              <AnimatedPressable
                style={styles.cancelButton}
                onPress={() => setShowCreate(false)}
                haptic={false}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </AnimatedPressable>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 4,
  },
  monoLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  heading: {
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
    marginBottom: 24,
  },

  // Invite Code Card
  codeCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 16,
  },
  codeLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  codeDisplay: {
    fontFamily: FontFamily.mono,
    fontSize: 32,
    letterSpacing: 6,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  codeActionText: {
    ...TypeScale.monoLabel,
    color: Colors.accent,
  },
  codeDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },

  // Info
  infoSection: {
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  descriptionText: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  infoValue: {
    fontFamily: FontFamily.heading,
    fontSize: 20,
    color: Colors.textPrimary,
  },

  // Members nav
  memberNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Config.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  memberNavText: {
    flex: 1,
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  chevron: {
    marginLeft: 'auto',
  },

  // Leave
  leaveSection: {
    marginTop: Config.spacing.sectionGap,
    alignItems: 'center',
    paddingBottom: 20,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceCard,
  },
  leaveText: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },

  // --- No Church state ---
  emptyCard: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },

  // Join
  joinSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inputWrapper: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeInput: {
    fontFamily: FontFamily.mono,
    fontSize: 18,
    color: Colors.textPrimary,
    padding: 18,
    textAlign: 'center',
    letterSpacing: 3,
  },
  joinButton: {
    borderRadius: Config.radius.md,
    overflow: 'hidden',
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  joinGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: Config.radius.md,
  },
  joinButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 17,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },

  // Or divider
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginHorizontal: 16,
  },

  // Create toggle
  createToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: Config.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  createToggleText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.accent,
  },

  // Create form
  createSection: {},
  createLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  createInput: {
    ...TypeScale.body,
    color: Colors.textPrimary,
    padding: 18,
  },
  multilineInput: {
    minHeight: 80,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  cancelText: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },

  // Edit mode
  headingEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  editIconBtn: {
    padding: 6,
  },
  editLabel: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  editSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Config.radius.sm,
  },
  editSaveText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  editCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editCancelText: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },
});
