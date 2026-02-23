import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { useFadeIn } from '../../hooks/useFadeIn';
import type { SharedReflection } from '../../types';

interface ReflectionCardProps {
  reflection: SharedReflection;
  index: number;
}

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ReflectionCard = ({
  reflection,
  index,
}: ReflectionCardProps): JSX.Element => {
  const fadeIn = useFadeIn(index * Config.animation.stagger.card);
  const isUser = reflection.isCurrentUser;

  const cardColors: readonly [string, string, ...string[]] = isUser
    ? [Colors.accentSoft, Colors.surfaceElevated]
    : [Colors.surfaceElevated, Colors.surfaceCard];

  return (
    <Animated.View style={fadeIn}>
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isUser && styles.cardUser]}
      >
        {/* Author row */}
        <View style={styles.authorRow}>
          <View
            style={[
              styles.avatar,
              isUser && styles.avatarUser,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isUser && styles.avatarTextUser,
              ]}
            >
              {reflection.authorInitials}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{reflection.authorName}</Text>
            <Text style={styles.authorMeta}>
              {formatRelativeDate(reflection.sharedAt)} ·{' '}
              {reflection.devotionalTitle}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Question */}
        <Text style={styles.question}>
          &ldquo;{reflection.questionText}&rdquo;
        </Text>

        {/* Answer */}
        <Text style={styles.answer}>{reflection.answerText}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Scripture pill */}
        <View style={styles.scripturePill}>
          <Text style={styles.scriptureText}>{reflection.scripture}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Config.radius.lg,
    padding: Config.spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Config.spacing.itemGap,
  },
  cardUser: {
    borderColor: Colors.borderAccent,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUser: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  avatarTextUser: {
    color: Colors.accent,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  authorMeta: {
    ...TypeScale.mono,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  question: {
    fontSize: 17,
    lineHeight: 17 * 1.4,
    fontFamily: FontFamily.drama,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  answer: {
    ...TypeScale.body,
    color: Colors.textPrimary,
  },
  scripturePill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Config.radius.sm,
  },
  scriptureText: {
    ...TypeScale.mono,
    color: Colors.textAccent,
  },
});
