import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../../components/Button';

export function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={40} color={colors.white} />
          </View>
          <Text style={styles.appName}>Life Devo</Text>
          <Text style={styles.tagline}>
            Daily devotionals from your pastor.{'\n'}Personal growth in community.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="sunny-outline" size={24} color={colors.secondary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Devotionals</Text>
              <Text style={styles.featureDesc}>Scripture and reflections from your pastor</Text>
            </View>
          </View>
          <View style={styles.feature}>
            <Ionicons name="pencil-outline" size={24} color={colors.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Personal Journal</Text>
              <Text style={styles.featureDesc}>Reflect, pray, and grow in the Word</Text>
            </View>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people-outline" size={24} color={colors.prayerBlue} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Church Community</Text>
              <Text style={styles.featureDesc}>Share reflections and pray for one another</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('SignUp')}
            size="lg"
          />
          <Button
            title="I Already Have an Account"
            onPress={() => navigation.navigate('SignIn')}
            variant="ghost"
            size="lg"
          />
        </View>
      </View>

      <Text style={styles.verse}>
        "His delight is in the law of the Lord, and on his law he meditates day and night." — Psalm 1:2
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.largeTitle,
    color: colors.text,
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  featureDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  buttons: {
    gap: spacing.sm,
  },
  verse: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
