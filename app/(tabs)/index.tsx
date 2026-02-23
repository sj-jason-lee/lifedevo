import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TypeScale, FontFamily } from '../../constants/typography';
import { Config } from '../../constants/config';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { HeroDevotional } from '../../components/sections/HeroDevotional';
import { ReadingProgress } from '../../components/sections/ReadingProgress';
import { RecentDevotionals } from '../../components/sections/RecentDevotionals';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useCompletions } from '../../lib/CompletionContext';
import {
  todayDevotional,
  readingPlan,
  recentDevotionals,
} from '../../lib/dummyData';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isComplete, completedIds } = useCompletions();
  const headerFade = useFadeIn(0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NoiseOverlay />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerFade]}>
          <Text style={styles.date}>{getFormattedDate()}</Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Hero Devotional */}
        <HeroDevotional devotional={todayDevotional} index={1} completed={isComplete(todayDevotional.id)} />

        {/* Reading Progress */}
        <View style={styles.section}>
          <ReadingProgress plan={readingPlan} index={2} />
        </View>

        {/* Recent Devotionals */}
        <View style={styles.section}>
          <RecentDevotionals devotionals={recentDevotionals} index={3} completedIds={completedIds} />
        </View>
      </Animated.ScrollView>
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
    paddingTop: 16,
  },
  header: {
    marginBottom: Config.spacing.sectionGap,
  },
  date: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  accentLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  section: {
    marginTop: Config.spacing.sectionGap,
  },
});
