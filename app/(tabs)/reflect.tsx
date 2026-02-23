import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { ReflectionCard } from '../../components/sections/ReflectionCard';
import { useReflections } from '../../lib/ReflectionContext';
import { useOnboarding } from '../../lib/OnboardingContext';

export default function ReflectScreen() {
  const insets = useSafeAreaInsets();
  const { communityFeed, isLoading } = useReflections();
  const { churchCode } = useOnboarding();
  const hasChurch = churchCode !== '';

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
        <Text style={styles.monoLabel}>{hasChurch ? 'YOUR CHURCH' : 'COMMUNITY'}</Text>
        <Text style={styles.heading}>Reflect</Text>
        <View style={styles.accentLine} />

        {/* Prompt banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {hasChurch
              ? "See how your church community is reflecting on this week's devotionals. Share your own reflections from any devotional to encourage others."
              : 'Join a church with a church code to see community reflections. You can add a church code from your profile.'}
          </Text>
        </View>

        {/* Feed */}
        {isLoading ? (
          <Text style={styles.loadingText}>Loading reflections...</Text>
        ) : communityFeed.length === 0 ? (
          <Text style={styles.emptyText}>
            No reflections yet. Be the first to share!
          </Text>
        ) : (
          communityFeed.map((reflection, i) => (
            <ReflectionCard key={reflection.id} reflection={reflection} index={i} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
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
  banner: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    padding: Config.spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  bannerText: {
    ...TypeScale.body,
    color: Colors.textSecondary,
  },
  loadingText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    ...TypeScale.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
