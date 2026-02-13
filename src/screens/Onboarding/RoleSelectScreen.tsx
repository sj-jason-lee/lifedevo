import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RoleSelect'>;
};

const { width: SCREEN_W } = Dimensions.get('window');

/* ───────────────────── animated role page ───────────────────── */

function RolePage({
  isActive,
  dark,
  icon,
  headline,
  description,
  btnLabel,
  onPress,
  hintText,
  activeIndex,
  dotIndex,
}: {
  isActive: boolean;
  dark?: boolean;
  icon: string;
  headline: string;
  description: string;
  btnLabel: string;
  onPress: () => void;
  hintText: string;
  activeIndex: number;
  dotIndex: number;
}) {
  const iconAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isActive) {
      iconAnim.setValue(0);
      textAnim.setValue(0);
      btnAnim.setValue(0);
      iconScale.setValue(0.5);

      Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(iconAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(iconScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]),
        Animated.timing(textAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btnAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  return (
    <SafeAreaView
      style={[styles.page, dark ? styles.shepherdPage : styles.readerPage]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            dark ? styles.iconCircleDark : styles.iconCircle,
            { opacity: iconAnim, transform: [{ scale: iconScale }] },
          ]}
        >
          <Text style={styles.iconEmoji}>{icon}</Text>
        </Animated.View>
        <Animated.Text
          style={[
            styles.headline,
            dark && styles.headlineLight,
            {
              opacity: textAnim,
              transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            },
          ]}
        >
          {headline}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.description,
            dark && styles.descriptionLight,
            {
              opacity: textAnim,
              transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            },
          ]}
        >
          {description}
        </Animated.Text>
      </View>
      <Animated.View
        style={[
          styles.bottom,
          {
            opacity: btnAnim,
            transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
          },
        ]}
      >
        <View style={styles.dots}>
          <View
            style={[
              styles.dot,
              dark && styles.dotDim,
              activeIndex === 0 && (dark ? styles.dotActiveLight : styles.dotActiveGreen),
            ]}
          />
          <View
            style={[
              styles.dot,
              dark && styles.dotDim,
              activeIndex === 1 && (dark ? styles.dotActiveLight : styles.dotActiveGreen),
            ]}
          />
        </View>
        <TouchableOpacity
          style={dark ? styles.shepherdBtn : styles.readerBtn}
          activeOpacity={0.85}
          onPress={onPress}
        >
          <Text style={dark ? styles.shepherdBtnText : styles.readerBtnText}>
            {btnLabel}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.hint, dark && styles.hintLight]}>{hintText}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

/* ───────────────────── main screen ───────────────────── */

export default function RoleSelectScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      setActiveIndex(index);
    },
    [],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <RolePage
          isActive={activeIndex === 0}
          icon="📖"
          headline={'Feed on\nthe Word'}
          description={'Receive daily devotionals, journal your\nreflections, and grow alongside your community.'}
          btnLabel="Continue as Reader"
          onPress={() => navigation.navigate('SignUp', { role: 'reader' })}
          hintText="Swipe to see other option"
          activeIndex={activeIndex}
          dotIndex={0}
        />
        <RolePage
          isActive={activeIndex === 1}
          dark
          icon="🌿"
          headline={'Lead your\nflock'}
          description={'Write and share devotionals, guide\nreflections, and nurture your community\'s growth.'}
          btnLabel="Continue as Shepherd"
          onPress={() => navigation.navigate('SignUp', { role: 'shepherd' })}
          hintText="Swipe to see other option"
          activeIndex={activeIndex}
          dotIndex={1}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  page: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: 'space-between',
  },
  readerPage: {
    backgroundColor: '#F4F7F2',
  },
  shepherdPage: {
    backgroundColor: '#1A1A1A',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconCircleDark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconEmoji: {
    fontSize: 38,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: spacing.md,
  },
  headlineLight: {
    color: '#FFFFFF',
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
  descriptionLight: {
    color: 'rgba(255,255,255,0.6)',
  },

  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  dotDim: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActiveGreen: {
    backgroundColor: colors.green,
  },
  dotActiveLight: {
    backgroundColor: '#FFFFFF',
  },
  readerBtn: {
    backgroundColor: colors.green,
    paddingVertical: 17,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  readerBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
  shepherdBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 17,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  shepherdBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
  },
  hintLight: {
    color: 'rgba(255,255,255,0.4)',
  },
});
