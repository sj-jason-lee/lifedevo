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
import { joinGroupByCode } from '../../services/groupService';
import StepIndicator from '../../components/StepIndicator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'JoinGroup'>;
};

export default function JoinGroupScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
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

  const handleJoin = async () => {
    if (!user) return;
    const trimmed = code.trim();
    if (!trimmed) {
      showToast({ message: 'Please enter an invite code.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const group = await joinGroupByCode(user.uid, trimmed);
      showToast({ message: `Joined "${group.name}"!`, type: 'success' });
      navigation.navigate('ReaderPreferences');
    } catch (e: any) {
      showToast({ message: e.message ?? 'Failed to join group.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('ReaderPreferences');
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
            <StepIndicator currentStep={1} totalSteps={2} />,
          )}

          {row(
            1,
            <>
              <Text style={styles.title}>Join a group</Text>
              <Text style={styles.subtitle}>
                Enter the invite code your shepherd shared with you.
              </Text>
            </>,
          )}

          {row(
            2,
            <View style={styles.codeContainer}>
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
            </View>,
          )}

          {row(
            3,
            <>
              <TouchableOpacity
                style={[styles.btn, submitting && styles.disabled]}
                activeOpacity={0.85}
                onPress={handleJoin}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.btnText}>Join Group</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                activeOpacity={0.6}
                onPress={handleSkip}
                disabled={submitting}
              >
                <Text style={styles.skipText}>Skip for now</Text>
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
    marginBottom: spacing.xxl,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  codeInput: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: 18,
    width: '100%',
    letterSpacing: 2,
  },
  btn: {
    backgroundColor: colors.green,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  btnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.6,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.textMuted,
  },
});
