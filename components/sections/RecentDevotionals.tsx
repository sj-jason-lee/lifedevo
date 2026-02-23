import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { TypeScale, FontFamily } from '../../constants/typography';
import { Config } from '../../constants/config';
import { GradientCard } from '../ui/GradientCard';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { useFadeIn } from '../../hooks/useFadeIn';
import type { Devotional } from '../../types';

interface RecentDevotionalsProps {
  devotionals: Devotional[];
  index: number;
  completedIds?: string[];
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const RecentDevotionals = ({
  devotionals,
  index,
  completedIds,
}: RecentDevotionalsProps): JSX.Element => {
  const fadeStyle = useFadeIn(index * Config.animation.stagger.card);

  return (
    <Animated.View style={[fadeStyle, styles.container]}>
      <Text style={styles.sectionTitle}>Recent</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {devotionals.map((devo) => (
          <AnimatedPressable
            key={devo.id}
            style={styles.cardWrapper}
            onPress={() => router.push(`/devotional/${devo.id}`)}
          >
            <GradientCard style={styles.card}>
              {completedIds?.includes(devo.id) && (
                <View style={styles.completedBadge}>
                  <Feather name="check-circle" size={14} color={Colors.accent} />
                </View>
              )}
              <Text style={styles.date}>{formatDate(devo.date)}</Text>
              <Text style={styles.title} numberOfLines={2}>
                {devo.title}
              </Text>
              <Text style={styles.scripture}>{devo.scripture}</Text>
              <View style={styles.footer}>
                <Text style={styles.readTime}>{devo.readTimeMinutes} min</Text>
              </View>
            </GradientCard>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -Config.spacing.screenHorizontal,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: Config.spacing.screenHorizontal,
  },
  scrollContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
    gap: 12,
  },
  cardWrapper: {
    width: 200,
  },
  card: {
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  date: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
  },
  scripture: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
});
