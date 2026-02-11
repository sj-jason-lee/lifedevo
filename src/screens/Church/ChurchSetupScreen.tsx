import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAppContext } from '../../services/store';

type Tab = 'join' | 'create';

export function ChurchSetupScreen() {
  const { createChurch, joinChurch, user } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('join');
  const [churchName, setChurchName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!churchName.trim()) {
      Alert.alert('Missing Name', 'Please enter your church name.');
      return;
    }
    setLoading(true);
    const error = await createChurch(churchName.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Error', error);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Missing Code', 'Please enter an invite code.');
      return;
    }
    setLoading(true);
    const error = await joinChurch(inviteCode.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={32} color={colors.white} />
            </View>
            <Text style={styles.title}>Join Your Church</Text>
            <Text style={styles.subtitle}>
              Connect with your church community to receive daily devotionals and grow together.
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'join' && styles.tabActive]}
              onPress={() => setActiveTab('join')}
            >
              <Text style={[styles.tabText, activeTab === 'join' && styles.tabTextActive]}>
                Join Church
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'create' && styles.tabActive]}
              onPress={() => setActiveTab('create')}
            >
              <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
                Create Church
              </Text>
            </TouchableOpacity>
          </View>

          {/* Join Tab */}
          {activeTab === 'join' && (
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Enter Invite Code</Text>
              <Text style={styles.formDesc}>
                Ask your pastor or church admin for the invite code.
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. GRACE2026"
                  placeholderTextColor={colors.textTertiary}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <Button
                title="Join Church"
                onPress={handleJoin}
                loading={loading}
                size="lg"
                style={styles.actionButton}
              />
            </Card>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Create a New Church</Text>
              <Text style={styles.formDesc}>
                Set up your church on Life Devo. You'll get an invite code to share with your congregation.
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Church name"
                  placeholderTextColor={colors.textTertiary}
                  value={churchName}
                  onChangeText={setChurchName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.roleNote}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.secondary} />
                <Text style={styles.roleNoteText}>
                  You'll be set as the pastor/admin of this church.
                </Text>
              </View>

              <Button
                title="Create Church"
                onPress={handleCreate}
                loading={loading}
                size="lg"
                style={styles.actionButton}
              />
            </Card>
          )}

          {/* Welcome note */}
          <Text style={styles.welcomeNote}>
            {user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : 'Welcome!'} You're almost ready to start your devotional journey.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md - 2,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  tabText: {
    ...typography.bodyBold,
    color: colors.textTertiary,
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.primary,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  inputIcon: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  roleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  roleNoteText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  welcomeNote: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
