import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAppContext } from '../../services/store';
import { parseCSV, generateTemplateCSV } from '../../services/csvParser';

const PRESETS = [
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: 'Custom', days: 0 },
];

type Method = 'manual' | 'csv' | 'paste';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function BatchSetupScreen({ navigation }: any) {
  const { user } = useAppContext();
  const [method, setMethod] = useState<Method | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState('');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  const getDayCount = (): number => {
    if (selectedPreset === null) return 0;
    const preset = PRESETS[selectedPreset];
    if (preset.days === 0) return parseInt(customDays, 10) || 0;
    return preset.days;
  };

  const dayCount = getDayCount();
  const endDate = dayCount > 0 ? addDays(startDate, dayCount - 1) : null;

  const handleManualContinue = () => {
    if (dayCount <= 0) {
      Alert.alert('Select Duration', 'Please choose how many days to create devotionals for.');
      return;
    }
    if (dayCount > 365) {
      Alert.alert('Too Many Days', 'Please select 365 days or fewer.');
      return;
    }
    const dates: string[] = [];
    for (let i = 0; i < dayCount; i++) {
      const d = addDays(startDate, i);
      dates.push(d.toISOString().split('T')[0]);
    }
    navigation.navigate('BatchList', { dates });
  };

  const handlePickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/*', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsed = parseCSV(content);

      if (parsed.length === 0) {
        Alert.alert('No Data', 'Could not find any devotional rows in the file.');
        return;
      }

      navigation.navigate('ImportReview', { results: parsed });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to read file');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const csv = generateTemplateCSV();
      const fileUri = FileSystem.documentDirectory + 'devotional_template.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Save Template CSV',
        });
      } else {
        Alert.alert('Saved', `Template saved to ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create template');
    }
  };

  // Method selection screen
  if (!method) {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Batch Create" streakCount={user?.streakCount || 0} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>How do you want to create?</Text>
          <Text style={styles.subheading}>
            Choose a method to create multiple devotionals at once.
          </Text>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setMethod('manual')}
            activeOpacity={0.7}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="create-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Write Manually</Text>
              <Text style={styles.methodDesc}>
                Pick a date range and fill in each day one by one
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setMethod('csv')}
            activeOpacity={0.7}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="document-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Import from CSV</Text>
              <Text style={styles.methodDesc}>
                Upload a spreadsheet file with all your devotionals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setMethod('paste')}
            activeOpacity={0.7}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="clipboard-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Paste from Spreadsheet</Text>
              <Text style={styles.methodDesc}>
                Copy & paste CSV text directly from a spreadsheet
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </View>
    );
  }

  // CSV file import
  if (method === 'csv') {
    return (
      <View style={styles.container}>
        <AppHeader subtitle="Import CSV" streakCount={user?.streakCount || 0} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Import from CSV</Text>

          <Card style={styles.formatCard}>
            <Text style={styles.formatTitle}>CSV FORMAT</Text>
            <Text style={styles.formatCode}>
              date, scripture_ref, scripture_text,{'\n'}reflection, prayer_prompt, questions
            </Text>
            <Text style={styles.formatHint}>
              Separate questions with the | character
            </Text>
          </Card>

          <TouchableOpacity
            style={styles.downloadTemplate}
            onPress={handleDownloadTemplate}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={18} color={colors.secondary} />
            <Text style={styles.downloadText}>Download Template CSV</Text>
          </TouchableOpacity>

          {/* File picker area */}
          <TouchableOpacity
            style={styles.dropZone}
            onPress={handlePickCSV}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
            <Text style={styles.dropZoneTitle}>Pick CSV File</Text>
            <Text style={styles.dropZoneHint}>Tap to browse your files</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <Button
              title="Back"
              onPress={() => setMethod(null)}
              variant="outline"
              style={styles.halfButton}
            />
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </View>
    );
  }

  // Paste CSV — navigate to dedicated screen via effect
  React.useEffect(() => {
    if (method === 'paste') {
      setMethod(null);
      navigation.navigate('PasteCSV');
    }
  }, [method, navigation]);

  // Manual mode — duration picker
  return (
    <View style={styles.container}>
      <AppHeader subtitle="Write Manually" streakCount={user?.streakCount || 0} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>How many days?</Text>
        <Text style={styles.subheading}>
          Pick a date range and fill in each day one by one.
        </Text>

        <View style={styles.presetsGrid}>
          {PRESETS.map((preset, index) => (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.presetCard,
                selectedPreset === index && styles.presetCardSelected,
              ]}
              onPress={() => setSelectedPreset(index)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.presetLabel,
                selectedPreset === index && styles.presetLabelSelected,
              ]}>
                {preset.label}
              </Text>
              {preset.days > 0 && (
                <Text style={[
                  styles.presetDays,
                  selectedPreset === index && styles.presetDaysSelected,
                ]}>
                  {preset.days} days
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedPreset !== null && PRESETS[selectedPreset].days === 0 && (
          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Number of days:</Text>
            <TextInput
              style={styles.customInput}
              keyboardType="number-pad"
              value={customDays}
              onChangeText={setCustomDays}
              placeholder="e.g. 45"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
          </View>
        )}

        <View style={styles.rangeCard}>
          <View style={styles.rangeRow}>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Starting from</Text>
              <Text style={styles.rangeValue}>{formatDate(startDate)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>Ending on</Text>
              <Text style={styles.rangeValue}>
                {endDate ? formatDate(endDate) : '---'}
              </Text>
            </View>
          </View>
          {dayCount > 0 && (
            <Text style={styles.rangeSummary}>
              {dayCount} devotional{dayCount !== 1 ? 's' : ''} to write
            </Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Back"
            onPress={() => setMethod(null)}
            variant="outline"
            style={styles.halfButton}
          />
          <Button
            title="Continue"
            onPress={handleManualContinue}
            disabled={dayCount <= 0}
            style={styles.continueButton}
          />
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  heading: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  // Method selection
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  methodTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  methodDesc: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  // CSV format
  formatCard: {
    backgroundColor: colors.surfaceSecondary,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  formatTitle: {
    ...typography.sectionLabel,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  formatCode: {
    ...typography.caption,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
  },
  formatHint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  downloadTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  downloadText: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dropZoneTitle: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  dropZoneHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  // Manual mode
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  presetCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  presetLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  presetLabelSelected: {
    color: colors.primary,
  },
  presetDays: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  presetDaysSelected: {
    color: colors.primaryLight,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  customLabel: {
    ...typography.body,
    color: colors.text,
  },
  customInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: 100,
    textAlign: 'center',
    ...typography.bodyBold,
    color: colors.text,
  },
  rangeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.lg,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeItem: {
    alignItems: 'center',
    flex: 1,
  },
  rangeLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  rangeValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  rangeSummary: {
    ...typography.caption,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
