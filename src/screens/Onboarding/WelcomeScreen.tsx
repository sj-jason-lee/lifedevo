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
import type { AppStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'Welcome'>;
};

const { width: SCREEN_W } = Dimensions.get('window');

type Slide = {
  icon: string;
  headline: string;
  body: string;
};

const readerSlides: Slide[] = [
  {
    icon: '\u{1F305}',
    headline: 'Your daily pasture\nawaits',
    body: 'Each morning, a fresh devotional is waiting\nfor you \u2014 read, reflect, and be renewed.',
  },
  {
    icon: '\u270D\uFE0F',
    headline: 'Reflect and grow',
    body: 'Journal your thoughts, track your streak,\nand share insights with your community.',
  },
];

const shepherdSlides: Slide[] = [
  {
    icon: '\u{1F33F}',
    headline: 'Your flock is\nwaiting',
    body: 'Write devotionals that reach your community\nevery morning \u2014 simple, focused, and personal.',
  },
  {
    icon: '\u{1F4CA}',
    headline: 'Guide their\njourney',
    body: 'See how your community engages, responds,\nand grows through the reflections you share.',
  },
];

function getSlides(role: UserRole): Slide[] {
  return role === 'reader' ? readerSlides : shepherdSlides;
}

/* ───────────────────── animated slide ───────────────────── */

function AnimatedSlide({ slide, isActive }: { slide: Slide; isActive: boolean }) {
  const iconAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      iconAnim.setValue(0);
      iconScale.setValue(0.6);
      textAnim.setValue(0);
      bodyAnim.setValue(0);

      Animated.stagger(120, [
        Animated.parallel([
          Animated.timing(iconAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.spring(iconScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]),
        Animated.timing(textAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(bodyAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <Animated.View
        style={[
          styles.iconCircle,
          { opacity: iconAnim, transform: [{ scale: iconScale }] },
        ]}
      >
        <Text style={styles.iconEmoji}>{slide.icon}</Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.headline,
          {
            opacity: textAnim,
            transform: [
              { translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            ],
          },
        ]}
      >
        {slide.headline}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.body,
          {
            opacity: bodyAnim,
            transform: [
              { translateY: bodyAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
          },
        ]}
      >
        {slide.body}
      </Animated.Text>
    </View>
  );
}

/* ───────────────────── main screen ───────────────────── */

export default function WelcomeScreen({ navigation }: Props) {
  const { userProfile } = useAuth();
  const role = userProfile?.role ?? 'reader';
  const slides = getSlides(role);
  const [activeIndex, setActiveIndex] = useState(0);

  const btnAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      setActiveIndex(index);
    },
    [],
  );

  const isLast = activeIndex === slides.length - 1;

  // Animate button in when reaching last slide
  useEffect(() => {
    Animated.timing(btnAnim, {
      toValue: isLast ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isLast]);

  const handleLetsGo = () => {
    if (role === 'shepherd') {
      navigation.navigate('ShepherdProfileSetup');
    } else {
      navigation.navigate('JoinGroup');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, i) => (
            <AnimatedSlide key={i} slide={slide} isActive={activeIndex === i} />
          ))}
        </ScrollView>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          <Animated.View
            style={{
              width: '100%',
              opacity: btnAnim,
              transform: [
                { translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
            }}
          >
            <TouchableOpacity
              style={[styles.btn, { opacity: isLast ? 1 : 0 }]}
              activeOpacity={0.85}
              disabled={!isLast}
              onPress={handleLetsGo}
            >
              <Text style={styles.btnText}>Let's go</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconEmoji: {
    fontSize: 42,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
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
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.text,
  },
  btn: {
    backgroundColor: colors.green,
    paddingVertical: 17,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.textInverse,
  },
});
