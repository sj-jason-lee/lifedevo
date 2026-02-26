import { useReducer, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Colors } from '../../constants/colors';
import { FontFamily, TypeScale } from '../../constants/typography';
import { Config } from '../../constants/config';
import { AnimatedPressable } from '../../components/ui/AnimatedPressable';
import { GradientCard } from '../../components/ui/GradientCard';
import { NoiseOverlay } from '../../components/ui/NoiseOverlay';
import { useFadeIn } from '../../hooks/useFadeIn';
import { useAuth } from '../../lib/AuthContext';
import { useOnboarding } from '../../lib/OnboardingContext';
import { useChurch } from '../../hooks/useChurch';
import {
  generateTemplateCSV,
  parseDevotionalCSV,
  batchInsertDevotionals,
  type ParsedRow,
} from '../../lib/csvTemplate';

// --- State machine ---
type Phase = 'idle' | 'preview' | 'importing' | 'complete';

interface State {
  phase: Phase;
  rows: ParsedRow[];
  globalErrors: string[];
  progress: number;
  total: number;
  insertedCount: number;
  insertErrors: string[];
  showGuide: boolean;
}

type Action =
  | { type: 'PARSE_SUCCESS'; rows: ParsedRow[]; globalErrors: string[] }
  | { type: 'START_IMPORT'; total: number }
  | { type: 'IMPORT_PROGRESS'; completed: number }
  | { type: 'IMPORT_COMPLETE'; inserted: number; errors: string[] }
  | { type: 'RESET' }
  | { type: 'TOGGLE_GUIDE' };

const initialState: State = {
  phase: 'idle',
  rows: [],
  globalErrors: [],
  progress: 0,
  total: 0,
  insertedCount: 0,
  insertErrors: [],
  showGuide: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'PARSE_SUCCESS':
      return { ...state, phase: 'preview', rows: action.rows, globalErrors: action.globalErrors };
    case 'START_IMPORT':
      return { ...state, phase: 'importing', total: action.total, progress: 0 };
    case 'IMPORT_PROGRESS':
      return { ...state, progress: action.completed };
    case 'IMPORT_COMPLETE':
      return { ...state, phase: 'complete', insertedCount: action.inserted, insertErrors: action.errors };
    case 'RESET':
      return initialState;
    case 'TOGGLE_GUIDE':
      return { ...state, showGuide: !state.showGuide };
    default:
      return state;
  }
};

// --- Component ---
export default function ImportDevotionalsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { userName } = useOnboarding();
  const { church } = useChurch();
  const headerFade = useFadeIn(0);
  const contentFade = useFadeIn(Config.animation.stagger.card);

  const [state, dispatch] = useReducer(reducer, initialState);

  // Animated progress
  const progressAnim = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (state.phase === 'importing' && state.total > 0) {
      progressAnim.value = withTiming(state.progress / state.total, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [state.progress, state.total, state.phase]);

  useEffect(() => {
    if (state.phase === 'complete') {
      checkScale.value = withSpring(1, { damping: 10, stiffness: 120 });
    } else {
      checkScale.value = 0;
    }
  }, [state.phase]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const validRows = state.rows.filter((r) => r.errors.length === 0);
  const invalidRows = state.rows.filter((r) => r.errors.length > 0);

  // --- Handlers ---
  const handleDownloadTemplate = useCallback(async () => {
    const csv = generateTemplateCSV();
    const fileUri = FileSystem.cacheDirectory + 'devotional_template.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Save Devotional Template',
      UTI: 'public.comma-separated-values-text',
    });
  }, []);

  const handlePickFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/csv', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const csvString = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const { rows, errors } = parseDevotionalCSV(csvString);
    dispatch({ type: 'PARSE_SUCCESS', rows, globalErrors: errors });
  }, []);

  const handleImport = useCallback(async () => {
    if (!user?.id) return;
    const toImport = validRows.map((r) => r.data);
    dispatch({ type: 'START_IMPORT', total: toImport.length });

    const result = await batchInsertDevotionals(
      toImport,
      user.id,
      church?.id ?? null,
      userName,
      (completed, total) => {
        dispatch({ type: 'IMPORT_PROGRESS', completed });
      },
    );

    dispatch({ type: 'IMPORT_COMPLETE', inserted: result.inserted, errors: result.errors });
  }, [validRows, user, church, userName]);

  // --- Render phases ---
  const renderIdle = () => (
    <Animated.View style={contentFade}>
      {/* Upload area */}
      <View style={styles.uploadArea}>
        <View style={styles.uploadIconCircle}>
          <Feather name="upload-cloud" size={32} color={Colors.textAccent} />
        </View>
        <Text style={styles.uploadTitle}>Bulk Import Devotionals</Text>
        <Text style={styles.uploadSubtitle}>
          Download the CSV template, fill it in with your devotionals, then upload it here.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <AnimatedPressable style={styles.secondaryButton} onPress={handleDownloadTemplate}>
          <Feather name="download" size={18} color={Colors.textAccent} />
          <Text style={styles.secondaryButtonText}>Download Template</Text>
        </AnimatedPressable>

        <AnimatedPressable onPress={handlePickFile}>
          <LinearGradient
            colors={[Colors.accent, '#B8972F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Feather name="file-text" size={18} color={Colors.textDark} />
            <Text style={styles.primaryButtonText}>Select CSV File</Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>

      {/* Format guide */}
      <View style={styles.guideSection}>
        <AnimatedPressable
          style={styles.guideHeader}
          onPress={() => dispatch({ type: 'TOGGLE_GUIDE' })}
        >
          <Text style={styles.guideHeaderText}>FORMAT GUIDE</Text>
          <Feather
            name={state.showGuide ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textMuted}
          />
        </AnimatedPressable>
        {state.showGuide && (
          <GradientCard style={styles.guideCard}>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>title *</Text>
              <Text style={styles.guideDesc}>Devotional title</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>scripture *</Text>
              <Text style={styles.guideDesc}>Reference (e.g. John 10:11)</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>scripture_text *</Text>
              <Text style={styles.guideDesc}>Full scripture passage</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>body *</Text>
              <Text style={styles.guideDesc}>Devotional content</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>reflect_question_1 *</Text>
              <Text style={styles.guideDesc}>At least one question required</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>reflect_question_2–5</Text>
              <Text style={styles.guideDesc}>Optional extra questions</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>prayer *</Text>
              <Text style={styles.guideDesc}>Closing prayer</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>date *</Text>
              <Text style={styles.guideDesc}>YYYY-MM-DD format</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>author_name</Text>
              <Text style={styles.guideDesc}>Defaults to your name</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>status</Text>
              <Text style={styles.guideDesc}>draft / scheduled / published</Text>
            </View>
            <View style={styles.guideRow}>
              <Text style={styles.guideColumn}>scheduled_date</Text>
              <Text style={styles.guideDesc}>ISO datetime for scheduled</Text>
            </View>
            <View style={styles.guideTip}>
              <Feather name="info" size={14} color={Colors.textMuted} />
              <Text style={styles.guideTipText}>
                Fields with commas or newlines should be wrapped in double quotes. * = required.
              </Text>
            </View>
          </GradientCard>
        )}
      </View>
    </Animated.View>
  );

  const renderPreview = () => (
    <Animated.View style={contentFade}>
      {/* Global errors */}
      {state.globalErrors.length > 0 && (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={16} color={Colors.accent} />
          <Text style={styles.errorText}>{state.globalErrors.join('; ')}</Text>
        </View>
      )}

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        {validRows.length > 0 && (
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#34C759' }]} />
            <Text style={styles.summaryText}>{validRows.length} ready to import</Text>
          </View>
        )}
        {invalidRows.length > 0 && (
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#FF3B30' }]} />
            <Text style={styles.summaryText}>{invalidRows.length} with errors</Text>
          </View>
        )}
      </View>

      {/* Row cards */}
      {state.rows.map((row) => {
        const hasErrors = row.errors.length > 0;
        return (
          <View key={row.rowNumber} style={styles.rowCardSpacing}>
            <GradientCard
              style={[
                styles.rowCard,
                hasErrors && styles.rowCardError,
                !hasErrors && row.isDuplicateDate && styles.rowCardWarning,
              ]}
            >
              <View style={styles.rowCardHeader}>
                <Text style={styles.rowNumber}>ROW {row.rowNumber}</Text>
                {hasErrors ? (
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,59,48,0.15)' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#FF3B30' }]}>ERROR</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(52,199,89,0.15)' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#34C759' }]}>VALID</Text>
                  </View>
                )}
              </View>

              <Text style={styles.rowTitle} numberOfLines={1}>
                {row.data.title || 'Untitled'}
              </Text>

              <View style={styles.rowMeta}>
                <Text style={styles.rowMetaText}>{row.data.scripture || '—'}</Text>
                <Text style={styles.rowMetaDot}> · </Text>
                <Text style={styles.rowMetaText}>{row.data.date || '—'}</Text>
                <Text style={styles.rowMetaDot}> · </Text>
                <View style={[styles.miniStatusBadge, { backgroundColor: Colors.accentDim }]}>
                  <Text style={styles.miniStatusText}>{row.data.status.toUpperCase()}</Text>
                </View>
              </View>

              {row.isDuplicateDate && !hasErrors && (
                <View style={styles.warningRow}>
                  <Feather name="alert-triangle" size={12} color="#FF9500" />
                  <Text style={styles.warningText}>Duplicate date with another row</Text>
                </View>
              )}

              {hasErrors && (
                <View style={styles.errorList}>
                  {row.errors.map((err, i) => (
                    <View key={i} style={styles.errorRow}>
                      <Feather name="x" size={12} color="#FF3B30" />
                      <Text style={styles.errorItemText}>{err}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GradientCard>
          </View>
        );
      })}

      {/* Action buttons */}
      <View style={styles.previewActions}>
        <AnimatedPressable style={styles.secondaryButton} onPress={() => dispatch({ type: 'RESET' })}>
          <Feather name="x" size={18} color={Colors.textAccent} />
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </AnimatedPressable>

        {validRows.length > 0 && (
          <AnimatedPressable onPress={handleImport}>
            <LinearGradient
              colors={[Colors.accent, '#B8972F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Feather name="upload" size={18} color={Colors.textDark} />
              <Text style={styles.primaryButtonText}>
                Import {validRows.length} Devotional{validRows.length !== 1 ? 's' : ''}
              </Text>
            </LinearGradient>
          </AnimatedPressable>
        )}
      </View>
    </Animated.View>
  );

  const renderImporting = () => (
    <View style={styles.centeredPhase}>
      <ActivityIndicator size="large" color={Colors.accent} style={{ marginBottom: 24 }} />
      <Text style={styles.importingTitle}>
        Importing {state.progress} of {state.total}...
      </Text>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressBarStyle]} />
      </View>

      <Text style={styles.importingHint}>Please don't close this screen</Text>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.centeredPhase}>
      <Animated.View style={[styles.checkCircle, checkStyle]}>
        <Feather name="check" size={40} color="#34C759" />
      </Animated.View>

      <Text style={styles.completeTitle}>
        {state.insertErrors.length === 0
          ? `Successfully imported ${state.insertedCount} devotional${state.insertedCount !== 1 ? 's' : ''}`
          : `Imported ${state.insertedCount} of ${state.total} devotionals`}
      </Text>

      {state.insertErrors.length > 0 && (
        <GradientCard style={styles.completeErrorCard}>
          <Text style={styles.completeErrorTitle}>Some batches failed:</Text>
          {state.insertErrors.map((err, i) => (
            <Text key={i} style={styles.completeErrorItem}>{err}</Text>
          ))}
        </GradientCard>
      )}

      <View style={styles.completeActions}>
        <AnimatedPressable onPress={() => router.push('/admin')}>
          <LinearGradient
            colors={[Colors.accent, '#B8972F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Feather name="list" size={18} color={Colors.textDark} />
            <Text style={styles.primaryButtonText}>View Devotionals</Text>
          </LinearGradient>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.secondaryButton}
          onPress={() => dispatch({ type: 'RESET' })}
        >
          <Feather name="upload-cloud" size={18} color={Colors.textAccent} />
          <Text style={styles.secondaryButtonText}>Import More</Text>
        </AnimatedPressable>
      </View>
    </View>
  );

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
        <Animated.View style={headerFade}>
          <View style={styles.headerRow}>
            <AnimatedPressable
              style={styles.backButton}
              onPress={() => {
                if (state.phase === 'importing') return;
                router.back();
              }}
            >
              <Feather
                name="arrow-left"
                size={22}
                color={state.phase === 'importing' ? Colors.textMuted : Colors.textPrimary}
              />
            </AnimatedPressable>
          </View>
          <Text style={styles.headerLabel}>ADMIN</Text>
          <Text style={styles.headerTitle}>Bulk Import</Text>
          <View style={styles.accentLine} />
        </Animated.View>

        {/* Phase content */}
        {state.phase === 'idle' && renderIdle()}
        {state.phase === 'preview' && renderPreview()}
        {state.phase === 'importing' && renderImporting()}
        {state.phase === 'complete' && renderComplete()}
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

  // Header
  headerRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    ...TypeScale.mono,
    color: Colors.textAccent,
    marginBottom: 8,
  },
  headerTitle: {
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

  // Upload area
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderAccent,
    borderRadius: Config.radius.lg,
    backgroundColor: Colors.accentSoft,
    marginBottom: 24,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    ...TypeScale.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Buttons
  buttonGroup: {
    gap: 12,
    marginBottom: 32,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: Config.radius.md,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    backgroundColor: Colors.surfaceCard,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 15,
    color: Colors.textAccent,
    letterSpacing: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Config.radius.md,
  },
  primaryButtonText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 16,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },

  // Format guide
  guideSection: {
    marginBottom: 24,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  guideHeaderText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  guideCard: {
    padding: 16,
    gap: 0,
  },
  guideRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  guideColumn: {
    fontFamily: FontFamily.mono,
    fontSize: 12,
    color: Colors.textAccent,
    width: 140,
    letterSpacing: 0.5,
  },
  guideDesc: {
    ...TypeScale.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  guideTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
  },
  guideTipText: {
    ...TypeScale.caption,
    color: Colors.textMuted,
    flex: 1,
  },

  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accentDim,
    padding: 14,
    borderRadius: Config.radius.sm,
    marginBottom: 20,
  },
  errorText: {
    ...TypeScale.body,
    color: Colors.textAccent,
    flex: 1,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Config.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  // Row cards
  rowCardSpacing: {
    marginBottom: 12,
  },
  rowCard: {
    padding: 18,
  },
  rowCardError: {
    borderColor: 'rgba(255,59,48,0.3)',
    borderWidth: 1.5,
  },
  rowCardWarning: {
    borderColor: 'rgba(255,149,0,0.3)',
    borderWidth: 1.5,
  },
  rowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowNumber: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  rowTitle: {
    fontSize: 17,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rowMetaText: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  rowMetaDot: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },
  miniStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniStatusText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.textAccent,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  warningText: {
    fontFamily: FontFamily.mono,
    fontSize: 11,
    color: '#FF9500',
    letterSpacing: 0.5,
  },
  errorList: {
    marginTop: 10,
    gap: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorItemText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: '#FF3B30',
    flex: 1,
  },

  // Preview actions
  previewActions: {
    marginTop: 20,
    gap: 12,
  },

  // Importing phase
  centeredPhase: {
    alignItems: 'center',
    paddingTop: 40,
  },
  importingTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  importingHint: {
    ...TypeScale.mono,
    color: Colors.textMuted,
  },

  // Complete phase
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52,199,89,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 20,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  completeErrorCard: {
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  completeErrorTitle: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 8,
  },
  completeErrorItem: {
    fontFamily: FontFamily.mono,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  completeActions: {
    width: '100%',
    gap: 12,
  },
});
