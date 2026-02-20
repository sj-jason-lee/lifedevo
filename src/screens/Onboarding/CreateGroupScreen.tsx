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
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createGroup } from '../../services/groupService';
import StepIndicator from '../../components/StepIndicator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'CreateGroup'>;
};

export default function CreateGroupScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Staggered entrance — 4 elements
  const anims = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
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
    if (!groupName.trim()) {
      showToast({ message: 'Please enter a group name.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const { groupId, inviteCode } = await createGroup(
        user.uid,
        groupName.trim(),
        description.trim(),
      );
      navigation.navigate('InviteReaders', { groupId, inviteCode });
    } catch (e: any) {
      console.error('[CreateGroup] Error:', e.code, e.message, e);
      showToast({ message: `Failed to create group: ${e.message}`, type: 'error' });
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
            <StepIndicator currentStep={2} totalSteps={3} />,
          )}

          {row(
            1,
            <>
              <Text style={styles.title}>Create your group</Text>
              <Text style={styles.subtitle}>
                Give your flock a name and tell them what to expect.
              </Text>
            </>,
          )}

          {row(
            2,
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Morning Devotionals"
                  placeholderTextColor={colors.border}
                  value={groupName}
                  onChangeText={setGroupName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!submitting}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.descInput]}
                  placeholder="What will your group be reading together?"
                  placeholderTextColor={colors.border}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  editable={!submitting}
                />
              </View>
            </>,
          )}

          {row(
            3,
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
            </TouchableOpacity>,
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
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
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
  descInput: {
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
