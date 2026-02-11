import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAppContext } from '../../services/store';
import { parseCSV } from '../../services/csvParser';

export function PasteCSVScreen({ navigation }: any) {
  const { user } = useAppContext();
  const [csvText, setCsvText] = useState('');

  const handleParse = () => {
    if (!csvText.trim()) {
      Alert.alert('Empty', 'Please paste your CSV data first.');
      return;
    }

    const results = parseCSV(csvText);
    if (results.length === 0) {
      Alert.alert('No Data', 'Could not find any devotional rows in the pasted text.');
      return;
    }

    navigation.navigate('ImportReview', { results });
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Paste Devotionals" streakCount={user?.streakCount || 0} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text style={styles.instructions}>
            Paste CSV text below. Each row becomes one devotional.
          </Text>

          <Card style={styles.formatCard}>
            <Text style={styles.formatTitle}>COLUMN ORDER</Text>
            <Text style={styles.formatText}>
              date, scripture_ref, scripture_text, reflection, prayer_prompt, questions
            </Text>
            <Text style={styles.formatHint}>
              Separate questions with | character
            </Text>
          </Card>

          <TextInput
            style={styles.textArea}
            placeholder={'2026-02-12, John 3:16, "For God so loved...", "Today we reflect...", "Lord help us...", "What does love mean?|How to show love?"'}
            placeholderTextColor={colors.textMuted}
            multiline
            value={csvText}
            onChangeText={setCsvText}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelBtn}
            />
            <Button
              title="Parse & Review"
              onPress={handleParse}
              disabled={!csvText.trim()}
              style={styles.parseBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  instructions: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
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
  formatText: {
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
  textArea: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 200,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  parseBtn: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
