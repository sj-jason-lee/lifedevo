import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { updateReaderPreferences } from '../../services/profileService';
import StepIndicator from '../../components/StepIndicator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'ReaderPreferences'>;
};

type ReadingGoal = 'daily' | 'weekly';
type DevotionalFrequency = 'every_day' | 'weekdays' | 'custom';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS = ['AM', 'PM'] as const;

function padMinute(m: number): string {
  return m < 10 ? `0${m}` : `${m}`;
}

export default function ReaderPreferencesScreen({ navigation }: Props) {
  const { user, completeOnboarding, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [readingGoal, setReadingGoal] = useState<ReadingGoal>('daily');
  const [frequency, setFrequency] = useState<DevotionalFrequency>('every_day');
  const [submitting, setSubmitting] = useState(false);

  const timeDisplay = `${hour}:${padMinute(minute)} ${period}`;

  // Staggered entrance — 5 elements
  const anims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    Animated.stagger(
      70,
      anims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true }),
      ),
    ).start();
  }, []);

  const row = (index: number, child: React.ReactNode) => (
    <Animated.View
      key={index}
      style={{
        opacity: anims[index],
        transform: [
          {
            translateY: anims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
      }}
    >
      {child}
    </Animated.View>
  );

  const handleGetStarted = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await updateReaderPreferences(user.uid, {
        notificationTime: timeDisplay,
        readingGoal,
        devotionalFrequency: frequency,
      });
      await updateProfile({
        notificationTime: timeDisplay,
        readingGoal,
        devotionalFrequency: frequency,
      });
      await completeOnboarding();
    } catch {
      showToast({ message: 'Failed to save preferences. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
      >
        {row(
          0,
          <StepIndicator currentStep={2} totalSteps={2} />,
        )}

        {row(
          1,
          <>
            <Text style={styles.title}>Set your preferences</Text>
            <Text style={styles.subtitle}>
              Customize your devotional experience.
            </Text>
          </>,
        )}

        {/* Notification time */}
        {row(
          2,
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Time</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeDisplay}>{timeDisplay}</Text>
              <TouchableOpacity
                style={styles.changeBtn}
                activeOpacity={0.7}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>,
        )}

        {/* Reading goal */}
        {row(
          3,
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reading Goal</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="Daily"
                  selected={readingGoal === 'daily'}
                  onPress={() => setReadingGoal('daily')}
                />
                <Chip
                  label="Weekly"
                  selected={readingGoal === 'weekly'}
                  onPress={() => setReadingGoal('weekly')}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Devotional Frequency</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="Every day"
                  selected={frequency === 'every_day'}
                  onPress={() => setFrequency('every_day')}
                />
                <Chip
                  label="Weekdays"
                  selected={frequency === 'weekdays'}
                  onPress={() => setFrequency('weekdays')}
                />
                <Chip
                  label="Custom"
                  selected={frequency === 'custom'}
                  onPress={() => setFrequency('custom')}
                />
              </View>
            </View>
          </>,
        )}

        {row(
          4,
          <TouchableOpacity
            style={[styles.btn, submitting && styles.disabled]}
            activeOpacity={0.85}
            onPress={handleGetStarted}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.btnText}>Get Started</Text>
            )}
          </TouchableOpacity>,
        )}
      </ScrollView>

      {/* Time picker modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Notification Time</Text>

            <View style={styles.pickerRow}>
              <PickerColumn
                data={HOURS}
                selected={hour}
                onSelect={setHour}
                label="Hour"
              />
              <Text style={styles.pickerSep}>:</Text>
              <PickerColumn
                data={MINUTES}
                selected={minute}
                onSelect={setMinute}
                label="Min"
                format={padMinute}
              />
              <PickerColumn
                data={[...PERIODS]}
                selected={period}
                onSelect={(v) => setPeriod(v as 'AM' | 'PM')}
                label=""
              />
            </View>

            <TouchableOpacity
              style={styles.modalBtn}
              activeOpacity={0.85}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ───────────────────── Chip ───────────────────── */

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ───────────────────── PickerColumn ───────────────────── */

function PickerColumn<T extends number | string>({
  data,
  selected,
  onSelect,
  label,
  format,
}: {
  data: T[];
  selected: T;
  onSelect: (v: T) => void;
  label: string;
  format?: (v: T) => string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: T }) => {
      const isSelected = item === selected;
      const display = format ? format(item) : `${item}`;
      return (
        <TouchableOpacity
          style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
          onPress={() => onSelect(item)}
        >
          <Text
            style={[
              styles.pickerItemText,
              isSelected && styles.pickerItemTextSelected,
            ]}
          >
            {display}
          </Text>
        </TouchableOpacity>
      );
    },
    [selected, format, onSelect],
  );

  return (
    <View style={styles.pickerColumn}>
      {label ? <Text style={styles.pickerLabel}>{label}</Text> : null}
      <FlatList
        data={data}
        keyExtractor={(item) => `${item}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={styles.pickerList}
        contentContainerStyle={styles.pickerListContent}
      />
    </View>
  );
}

/* ───────────────────── styles ───────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeDisplay: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 18,
    color: colors.text,
  },
  changeBtn: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.green,
  },

  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: colors.greenLight,
    borderColor: colors.green,
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.green,
  },

  btn: {
    backgroundColor: colors.green,
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderRadius: 20,
    padding: spacing.lg,
    width: '85%',
    maxHeight: 400,
  },
  modalTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pickerSep: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: colors.text,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pickerList: {
    maxHeight: 200,
    width: 60,
  },
  pickerListContent: {
    alignItems: 'center',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: colors.greenLight,
  },
  pickerItemText: {
    fontFamily: fonts.sans,
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    fontFamily: fonts.sansSemiBold,
    color: colors.green,
  },
  modalBtn: {
    backgroundColor: colors.green,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: colors.textInverse,
  },
});
