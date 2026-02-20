import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import StepIndicator from '../../components/StepIndicator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'InviteReaders'>;
  route: RouteProp<AppStackParamList, 'InviteReaders'>;
};

export default function InviteReadersScreen({ navigation, route }: Props) {
  const { inviteCode } = route.params;
  const { completeOnboarding } = useAuth();
  const { showToast } = useToast();

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

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    showToast({ message: 'Invite code copied!', type: 'success' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my group on Pasture! Use invite code: ${inviteCode}`,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {row(
          0,
          <StepIndicator currentStep={3} totalSteps={3} />,
        )}

        {row(
          1,
          <>
            <Text style={styles.title}>Invite your readers</Text>
            <Text style={styles.subtitle}>
              Share this code with your community so they can join your group.
            </Text>
          </>,
        )}

        {row(
          2,
          <TouchableOpacity
            style={styles.codeCard}
            activeOpacity={0.7}
            onPress={handleCopy}
          >
            <Text style={styles.codeLabel}>Invite Code</Text>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <View style={styles.copyRow}>
              <Ionicons name="copy-outline" size={16} color={colors.green} />
              <Text style={styles.copyText}>Tap to copy</Text>
            </View>
          </TouchableOpacity>,
        )}

        {row(
          3,
          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.85}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={colors.green} />
            <Text style={styles.shareBtnText}>Share Invite Link</Text>
          </TouchableOpacity>,
        )}

        <View style={styles.spacer} />

        {row(
          4,
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.85}
            onPress={handleFinish}
          >
            <Text style={styles.btnText}>Finish</Text>
          </TouchableOpacity>,
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
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
  codeCard: {
    backgroundColor: colors.greenLight,
    borderRadius: 16,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  codeText: {
    fontFamily: fonts.sansBold,
    fontSize: 32,
    color: colors.green,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.green,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 28,
    paddingVertical: 15,
    gap: 8,
  },
  shareBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.green,
  },
  spacer: {
    flex: 1,
  },
  btn: {
    backgroundColor: colors.green,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
});
