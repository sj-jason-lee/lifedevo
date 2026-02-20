import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { updateShepherdProfile } from '../../services/profileService';
import StepIndicator from '../../components/StepIndicator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'ShepherdProfileSetup'>;
};

const BIO_LIMIT = 200;

export default function ShepherdProfileSetupScreen({ navigation }: Props) {
  const { user, userProfile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '');
  const [churchName, setChurchName] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Staggered entrance — 6 elements
  const anims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    Animated.stagger(
      70,
      anims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true }),
      ),
    ).start();
  }, []);

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

  const handleContinue = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      showToast({ message: 'Please enter your name.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await updateShepherdProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        churchName: churchName.trim(),
      });
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        churchName: churchName.trim() || null,
      });
      navigation.navigate('CreateGroup');
    } catch {
      showToast({ message: 'Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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
          {row(
            0,
            <StepIndicator currentStep={1} totalSteps={3} />,
          )}

          {row(
            1,
            <>
              <Text style={styles.title}>Set up your profile</Text>
              <Text style={styles.subtitle}>
                Let your readers know who you are.
              </Text>
            </>,
          )}

          {row(
            2,
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
              </View>
              <Text style={styles.avatarHint}>Photo coming soon</Text>
            </View>,
          )}

          {row(
            3,
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.border}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!submitting}
              />
            </View>,
          )}

          {row(
            4,
            <View style={styles.field}>
              <Text style={styles.label}>Church / Organization</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Grace Community Church"
                placeholderTextColor={colors.border}
                value={churchName}
                onChangeText={setChurchName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!submitting}
              />
            </View>,
          )}

          {row(
            5,
            <>
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Bio</Text>
                  <Text style={styles.charCount}>
                    {bio.length}/{BIO_LIMIT}
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell your readers a little about yourself..."
                  placeholderTextColor={colors.border}
                  value={bio}
                  onChangeText={(t) => t.length <= BIO_LIMIT && setBio(t)}
                  multiline
                  textAlignVertical="top"
                  editable={!submitting}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, submitting && styles.disabled]}
                activeOpacity={0.85}
                onPress={handleContinue}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.btnText}>Continue</Text>
                )}
              </TouchableOpacity>
            </>,
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
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarHint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  field: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  charCount: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  btn: {
    backgroundColor: colors.green,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.6,
  },
});
