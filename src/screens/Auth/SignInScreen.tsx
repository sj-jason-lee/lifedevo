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
import type { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'SignIn'>;
};

function friendlyMessage(e: any): string {
  if (e.code === 'auth/account-exists-different-role') return e.message;
  switch (e.code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed': return 'Network error. Check your connection and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}

export default function SignInScreen({ navigation }: Props) {
  const { signIn, signInWithGoogle, error, clearError } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clear error when inputs change
  useEffect(() => {
    if (error) clearError();
  }, [email, password]);

  // Staggered entrance — 5 elements
  const anims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
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

  const handleSignIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      showToast({ message: friendlyMessage(e), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      if (e.code !== 'SIGN_IN_CANCELLED') {
        showToast({ message: friendlyMessage(e), type: 'error' });
      }
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
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {row(
            0,
            <>
              <Text style={styles.brand}>pasture</Text>
              <Text style={styles.title}>Welcome back</Text>
            </>,
          )}

          {row(
            1,
            <TouchableOpacity
              style={[styles.googleBtn, submitting && styles.disabled]}
              activeOpacity={0.7}
              onPress={handleGoogle}
              disabled={submitting}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>,
          )}

          {row(
            2,
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>,
          )}

          {row(
            3,
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.border}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Your password"
                    placeholderTextColor={colors.border}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!submitting}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>,
          )}

          {row(
            4,
            <>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.disabled]}
                activeOpacity={0.85}
                onPress={handleSignIn}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.submitText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footer}
                activeOpacity={0.6}
                onPress={() => navigation.navigate('RoleSelect')}
              >
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Text style={styles.footerLink}>Get started</Text>
                </Text>
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
    paddingBottom: spacing.xl,
  },

  back: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    width: 40,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.green,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    paddingVertical: 15,
    gap: 10,
    marginBottom: spacing.md,
  },
  googleIcon: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: colors.text,
  },
  googleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.text,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
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
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  errorText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.6,
  },

  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: fonts.sansSemiBold,
    color: colors.link,
  },
});
