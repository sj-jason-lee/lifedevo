import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useChurch } from '../../hooks/useChurch';
import { useAuth } from '../../lib/AuthContext';
import type { ChurchMember } from '../../types';

interface MemberRowProps {
  member: ChurchMember;
  index: number;
  isLeader: boolean;
  isCurrentUser: boolean;
  onRemove: (userId: string, name: string) => void;
}

const MemberRow = ({ member, index, isLeader, isCurrentUser, onRemove }: MemberRowProps) => {
  const fadeStyle = useFadeIn(Config.animation.stagger.card * (index + 2));

  return (
    <Animated.View style={[styles.memberRow, fadeStyle]}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitials}>{member.initials}</Text>
      </View>
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName}>
            {member.userName}
            {isCurrentUser ? ' (You)' : ''}
          </Text>
          {member.churchRole === 'leader' && (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderBadgeText}>LEADER</Text>
            </View>
          )}
        </View>
      </View>
      {isLeader && !isCurrentUser && member.churchRole !== 'leader' && (
        <AnimatedPressable
          onPress={() => onRemove(member.userId, member.userName)}
          style={styles.removeButton}
        >
          <Feather name="x" size={16} color="#C0392B" />
        </AnimatedPressable>
      )}
    </Animated.View>
  );
};

export default function MembersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { church, members, memberCount, isLeader, isLoading, removeMember } = useChurch();

  const headerFade = useFadeIn(0);
  const countFade = useFadeIn(Config.animation.stagger.card);

  const handleRemove = (userId: string, name: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${name} from the church?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await removeMember(userId);
            if (error) Alert.alert('Error', error);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!church) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No church found</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: ChurchMember; index: number }) => (
    <MemberRow
      member={item}
      index={index}
      isLeader={isLeader}
      isCurrentUser={item.userId === user?.id}
      onRemove={handleRemove}
    />
  );

  return (
    <View style={styles.container}>
      <NoiseOverlay />
      <View style={{ paddingTop: insets.top + 16, flex: 1 }}>
        {/* Header */}
        <Animated.View style={[styles.header, headerFade]}>
          <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </AnimatedPressable>
          <Text style={styles.monoLabel}>MEMBERS</Text>
          <View style={styles.headingRow}>
            <Text style={styles.heading}>Church Directory</Text>
            <Animated.View style={[styles.countBadge, countFade]}>
              <Text style={styles.countText}>{memberCount}</Text>
            </Animated.View>
          </View>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Members List */}
        <FlatList
          data={members}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 4,
  },
  monoLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  heading: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontFamily: FontFamily.heading,
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Config.radius.sm,
  },
  countText: {
    ...TypeScale.monoLabel,
    color: Colors.textAccent,
  },
  accentLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: Config.spacing.screenHorizontal,
  },

  // Member row
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentDim,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  memberInitials: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.accent,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  leaderBadge: {
    backgroundColor: Colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leaderBadgeText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.accent,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    ...TypeScale.body,
    color: Colors.textMuted,
  },
});
