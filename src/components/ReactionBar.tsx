import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

interface ReactionBarProps {
  reactions: { praying: number; amen: number; thanks: number };
  onReact?: (type: 'praying' | 'amen' | 'thanks') => void;
}

export function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.reaction}
        onPress={() => onReact?.('praying')}
        activeOpacity={0.7}
      >
        <Ionicons name="hand-left-outline" size={16} color={colors.prayerBlue} />
        <Text style={[styles.label, { color: colors.prayerBlue }]}>
          Praying {reactions.praying > 0 ? `(${reactions.praying})` : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.reaction}
        onPress={() => onReact?.('amen')}
        activeOpacity={0.7}
      >
        <Ionicons name="heart-outline" size={16} color={colors.amen} />
        <Text style={[styles.label, { color: colors.amen }]}>
          Amen {reactions.amen > 0 ? `(${reactions.amen})` : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.reaction}
        onPress={() => onReact?.('thanks')}
        activeOpacity={0.7}
      >
        <Ionicons name="thumbs-up-outline" size={16} color={colors.secondary} />
        <Text style={[styles.label, { color: colors.secondary }]}>
          Thanks {reactions.thanks > 0 ? `(${reactions.thanks})` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
  },
  label: {
    ...typography.caption,
    fontWeight: '500',
  },
});
