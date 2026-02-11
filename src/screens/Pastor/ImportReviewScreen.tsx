import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { useAppContext } from '../../services/store';
import { ParseResult } from '../../services/csvParser';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function ImportReviewScreen({ route, navigation }: any) {
  const { results } = route.params as { results: ParseResult[] };
  const { user, publishDevotional } = useAppContext();
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const okRows = results.filter((r) => r.status === 'ok' || r.status === 'warning');
  const errorRows = results.filter((r) => r.status === 'error');
  const warningRows = results.filter((r) => r.status === 'warning');
  const importableCount = okRows.filter((r) => r.data).length;

  const firstDate = okRows.find((r) => r.data)?.data?.date;
  const lastDate = [...okRows].reverse().find((r) => r.data)?.data?.date;

  const handleImport = async () => {
    if (importableCount === 0) {
      Alert.alert('Nothing to Import', 'There are no valid rows to import.');
      return;
    }

    Alert.alert(
      'Schedule Devotionals',
      `This will create ${importableCount} devotional${importableCount !== 1 ? 's' : ''}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule All',
          onPress: async () => {
            setIsImporting(true);
            let count = 0;

            for (const result of okRows) {
              if (!result.data) continue;
              const d = result.data;
              const error = await publishDevotional({
                scriptureRef: d.scriptureRef,
                scriptureText: d.scriptureText,
                reflection: d.reflection,
                prayerPrompt: d.prayerPrompt,
                questions: d.questions,
                publishDate: d.date,
              });
              if (!error) {
                count++;
                setImportedCount(count);
              }
            }

            setIsImporting(false);
            Alert.alert(
              'Import Complete',
              `Successfully scheduled ${count} devotional${count !== 1 ? 's' : ''}.`,
              [{ text: 'OK', onPress: () => navigation.navigate('ManageDevotionals') }]
            );
          },
        },
      ]
    );
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <Ionicons name="checkmark-circle" size={20} color={colors.completedGreen} />;
      case 'warning':
        return <Ionicons name="warning" size={20} color={colors.warning} />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color={colors.error} />;
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: ParseResult }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {statusIcon(item.status)}
        <View style={styles.rowInfo}>
          <Text style={styles.rowDate}>
            {item.data?.date ? formatDateLabel(item.data.date) : `Row ${item.row}`}
          </Text>
          {item.data?.scriptureRef ? (
            <Text style={styles.rowScripture} numberOfLines={1}>
              {item.data.scriptureRef}
              {item.data.questions.length > 0 && ` · ${item.data.questions.length} question${item.data.questions.length !== 1 ? 's' : ''}`}
            </Text>
          ) : null}
          {item.message ? (
            <Text style={[
              styles.rowMessage,
              item.status === 'error' && styles.rowMessageError,
              item.status === 'warning' && styles.rowMessageWarning,
            ]} numberOfLines={2}>
              {item.message}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Review Import" streakCount={user?.streakCount || 0} />

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          Found {results.length} devotional{results.length !== 1 ? 's' : ''}
        </Text>
        {firstDate && lastDate && (
          <Text style={styles.summaryRange}>
            {formatDateLabel(firstDate)} — {formatDateLabel(lastDate)}
          </Text>
        )}
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.completedGreen} />
            <Text style={styles.statText}>{okRows.length - warningRows.length} ready</Text>
          </View>
          {warningRows.length > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={styles.statText}>{warningRows.length} warning{warningRows.length !== 1 ? 's' : ''}</Text>
            </View>
          )}
          {errorRows.length > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="close-circle" size={16} color={colors.error} />
              <Text style={styles.statText}>{errorRows.length} error{errorRows.length !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress during import */}
      {isImporting && (
        <View style={styles.progressCard}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.progressText}>
            Importing {importedCount} of {importableCount}...
          </Text>
        </View>
      )}

      {/* Row List */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => `row-${item.row}`}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Button
          title={`Schedule ${importableCount} Devotional${importableCount !== 1 ? 's' : ''}`}
          onPress={handleImport}
          disabled={importableCount === 0 || isImporting}
          loading={isImporting}
          style={styles.importButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  summaryTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  summaryRange: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  row: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  rowInfo: {
    flex: 1,
  },
  rowDate: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  rowScripture: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rowMessage: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
  },
  rowMessageError: {
    color: colors.error,
  },
  rowMessageWarning: {
    color: colors.secondaryDark,
  },
  separator: {
    height: spacing.sm,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  importButton: {
    backgroundColor: colors.primary,
  },
});
