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
import { colors, fonts, spacing } from '../../theme';

type Props = {
  navigation: StackNavigationProp<any>;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Everything scales from PHONE_W — design baseline is 204pt (iPhone 15 @ 0.52)
const PHONE_W = SCREEN_W * 0.52;
const PHONE_H = PHONE_W * 1.9;
const S = PHONE_W / 204; // scale factor

const BEZEL_PAD = 10 * S;
const SCREEN_PAD = 12 * S;
const BEZEL_BORDER = 1;
const PAGE_W = PHONE_W - (BEZEL_PAD + BEZEL_BORDER + SCREEN_PAD) * 2;

/* ───────────────────── slide data ───────────────────── */

const slides = [
  {
    headline: 'A quiet place to\ngraze on God\'s Word',
    description: 'Daily devotionals, journaling, and\ncommunity — all in one place.',
  },
  {
    headline: 'Reflect and journal\nyour thoughts',
    description: 'Capture what God is speaking to you\nwith guided prompts.',
  },
  {
    headline: 'Grow together\nin community',
    description: 'Share insights and encourage one\nanother on the journey.',
  },
];

/* ───────────────────── phone screen contents ───────────────────── */

function PhoneScreenToday() {
  return (
    <View style={{ width: PAGE_W }}>
      <Text style={mockup.screenDate}>Wed, Feb 12</Text>
      <Text style={mockup.screenGreeting}>Good morning</Text>

      <View style={mockup.devoCard}>
        <View style={mockup.devoTop}>
          <View style={mockup.devoBadge}>
            <Text style={mockup.devoBadgeText}>Today</Text>
          </View>
        </View>
        <Text style={mockup.devoTitle}>Psalm 23</Text>
        <Text style={mockup.devoBody}>
          The Lord is my shepherd, I lack nothing.{'\n'}He makes me lie down
          in green pastures,{'\n'}he leads me beside quiet waters...
        </Text>
        <View style={mockup.devoBtn}>
          <Text style={mockup.devoBtnText}>Start reading</Text>
        </View>
      </View>

      <View style={mockup.stats}>
        <View style={mockup.stat}>
          <Text style={mockup.statVal}>7</Text>
          <Text style={mockup.statUnit}>day streak</Text>
        </View>
        <View style={mockup.statDivider} />
        <View style={mockup.stat}>
          <Text style={mockup.statVal}>12</Text>
          <Text style={mockup.statUnit}>entries</Text>
        </View>
        <View style={mockup.statDivider} />
        <View style={mockup.stat}>
          <Text style={mockup.statVal}>3</Text>
          <Text style={mockup.statUnit}>shared</Text>
        </View>
      </View>
    </View>
  );
}

function PhoneScreenJournal() {
  return (
    <View style={{ width: PAGE_W }}>
      <Text style={mockup.screenDate}>Wed, Feb 12</Text>
      <Text style={mockup.screenGreeting}>Journal</Text>

      <View style={mockup.prompt}>
        <Text style={mockup.promptLabel}>REFLECT</Text>
        <Text style={mockup.promptText}>
          What is God's invitation to you today?
        </Text>
      </View>

      <View style={mockup.journalEntry}>
        <Text style={mockup.journalTime}>8:32 AM</Text>
        <Text style={mockup.journalText}>
          I felt peace reading about the shepherd's care. God reminds me I don't
          need to carry everything alone...
        </Text>
      </View>

      <View style={mockup.journalEntry}>
        <Text style={mockup.journalTime}>Yesterday</Text>
        <Text style={mockup.journalText}>
          "Be still and know that I am God." Letting go of anxiety about work
          and trusting His timing.
        </Text>
      </View>
    </View>
  );
}

function PhoneScreenCommunity() {
  return (
    <View style={{ width: PAGE_W }}>
      <Text style={mockup.screenDate}>Wed, Feb 12</Text>
      <Text style={mockup.screenGreeting}>Community</Text>

      <View style={mockup.communityCard}>
        <View style={mockup.communityHeader}>
          <View style={mockup.avatar} />
          <View>
            <Text style={mockup.communityName}>Sarah M.</Text>
            <Text style={mockup.communityMeta}>Psalm 23 · 2h ago</Text>
          </View>
        </View>
        <Text style={mockup.communityBody}>
          This passage reminded me that rest is not laziness — it's trust.
        </Text>
        <View style={mockup.communityActions}>
          <Text style={mockup.communityAction}>♡ 5</Text>
          <Text style={mockup.communityAction}>💬 2</Text>
        </View>
      </View>

      <View style={mockup.communityCard}>
        <View style={mockup.communityHeader}>
          <View style={[mockup.avatar, { backgroundColor: '#C4D8C0' }]} />
          <View>
            <Text style={mockup.communityName}>James K.</Text>
            <Text style={mockup.communityMeta}>Psalm 23 · 4h ago</Text>
          </View>
        </View>
        <Text style={mockup.communityBody}>
          "He restores my soul" — exactly what I needed to hear today.
        </Text>
        <View style={mockup.communityActions}>
          <Text style={mockup.communityAction}>♡ 8</Text>
          <Text style={mockup.communityAction}>💬 1</Text>
        </View>
      </View>
    </View>
  );
}

const phoneScreens = [PhoneScreenToday, PhoneScreenJournal, PhoneScreenCommunity];

/* ───────────────────── phone mockup ───────────────────── */

type PhoneMockupProps = {
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

function PhoneMockup({ activeIndex, onIndexChange }: PhoneMockupProps) {
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const width = e.nativeEvent.layoutMeasurement.width;
      const index = Math.round(offsetX / width);
      onIndexChange(index);
    },
    [onIndexChange],
  );

  return (
    <View style={mockup.wrapper}>
      <View style={[mockup.bezel, { width: PHONE_W, height: PHONE_H }]}>
        <View style={mockup.island} />
        <View style={mockup.screen}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {phoneScreens.map((Screen, i) => (
              <Screen key={i} />
            ))}
          </ScrollView>
          <View style={mockup.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[mockup.dot, i === activeIndex && mockup.dotActive]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ───────────────────── main screen ───────────────────── */

export default function LandingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Entrance animations
  const brandAnim = useRef(new Animated.Value(0)).current;
  const headlineAnim = useRef(new Animated.Value(0)).current;
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const phoneScale = useRef(new Animated.Value(0.92)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;

  // Text crossfade on slide change
  const textFade = useRef(new Animated.Value(1)).current;
  const prevIndex = useRef(0);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(brandAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headlineAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(phoneAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(phoneScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(bottomAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (prevIndex.current !== activeIndex) {
      prevIndex.current = activeIndex;
      textFade.setValue(0);
      Animated.timing(textFade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  }, [activeIndex]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Animated.Text
            style={[styles.brand, { opacity: brandAnim, transform: [{ translateY: brandAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] }]}
          >
            pasture
          </Animated.Text>
          <Animated.Text
            style={[styles.headline, { opacity: Animated.multiply(headlineAnim, textFade), transform: [{ translateY: headlineAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}
          >
            {slides[activeIndex].headline}
          </Animated.Text>
        </View>

        <Animated.View
          style={[styles.middle, { opacity: phoneAnim, transform: [{ scale: phoneScale }] }]}
        >
          <PhoneMockup activeIndex={activeIndex} onIndexChange={setActiveIndex} />
        </Animated.View>

        <Animated.View
          style={[styles.bottom, { opacity: bottomAnim, transform: [{ translateY: bottomAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}
        >
          <Animated.Text style={[styles.description, { opacity: textFade }]}>
            {slides[activeIndex].description}
          </Animated.Text>

          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('RoleSelect')}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.loginText}>
              Have an account?{' '}
              <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

/* ───────────────────── styles ───────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },

  top: {
    paddingTop: 16 * S,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 16 * S,
    color: colors.green,
    letterSpacing: 2,
    textTransform: 'lowercase',
    marginBottom: 4 * S,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 26 * S,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34 * S,
  },

  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 16 * S,
    alignItems: 'center',
    gap: 8 * S,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 14 * S,
    lineHeight: 20 * S,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4 * S,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 15 * S,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16 * S,
    color: colors.textInverse,
  },
  loginText: {
    fontFamily: fonts.sans,
    fontSize: 14 * S,
    color: colors.textMuted,
  },
  loginLink: {
    fontFamily: fonts.sansSemiBold,
    color: colors.link,
  },
});

/* ───────────────────── mockup styles ───────────────────── */

const mockup = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 8 * S,
  },
  bezel: {
    backgroundColor: '#F8F8F6',
    borderRadius: 28 * S,
    borderWidth: BEZEL_BORDER,
    borderColor: '#E0E0DE',
    paddingHorizontal: BEZEL_PAD,
    paddingBottom: 12 * S,
    paddingTop: 8 * S,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 * S },
    shadowOpacity: 0.1,
    shadowRadius: 32 * S,
    elevation: 12,
  },
  island: {
    width: 60 * S,
    height: 18 * S,
    borderRadius: 10 * S,
    backgroundColor: '#1A1A1A',
    alignSelf: 'center',
    marginBottom: 10 * S,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 16 * S,
    padding: SCREEN_PAD,
    paddingTop: 14 * S,
    overflow: 'hidden',
  },
  screenDate: {
    fontFamily: fonts.sans,
    fontSize: 9 * S,
    color: colors.textMuted,
  },
  screenGreeting: {
    fontFamily: fonts.sansBold,
    fontSize: 16 * S,
    color: colors.text,
    marginTop: 2 * S,
    marginBottom: 10 * S,
  },

  devoCard: {
    backgroundColor: '#F4F7F2',
    borderRadius: 12 * S,
    padding: 10 * S,
    marginBottom: 8 * S,
  },
  devoTop: {
    flexDirection: 'row',
    marginBottom: 6 * S,
  },
  devoBadge: {
    backgroundColor: colors.green,
    borderRadius: 5 * S,
    paddingHorizontal: 6 * S,
    paddingVertical: 2 * S,
  },
  devoBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 8 * S,
    color: colors.textInverse,
  },
  devoTitle: {
    fontFamily: fonts.serif,
    fontSize: 14 * S,
    color: colors.text,
    marginBottom: 4 * S,
  },
  devoBody: {
    fontFamily: fonts.sans,
    fontSize: 9 * S,
    lineHeight: 14 * S,
    color: colors.textMuted,
    marginBottom: 8 * S,
  },
  devoBtn: {
    backgroundColor: colors.green,
    borderRadius: 8 * S,
    paddingVertical: 7 * S,
    alignItems: 'center',
  },
  devoBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10 * S,
    color: colors.textInverse,
  },

  prompt: {
    borderRadius: 10 * S,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10 * S,
    marginBottom: 8 * S,
  },
  promptLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 7 * S,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 3 * S,
  },
  promptText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10 * S,
    color: colors.text,
    lineHeight: 14 * S,
  },

  journalEntry: {
    backgroundColor: '#FAFAF8',
    borderRadius: 10 * S,
    padding: 10 * S,
    marginBottom: 6 * S,
  },
  journalTime: {
    fontFamily: fonts.sansMedium,
    fontSize: 8 * S,
    color: colors.textMuted,
    marginBottom: 4 * S,
  },
  journalText: {
    fontFamily: fonts.sans,
    fontSize: 9 * S,
    lineHeight: 14 * S,
    color: colors.text,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8F8F6',
    borderRadius: 10 * S,
    paddingVertical: 8 * S,
    paddingHorizontal: 6 * S,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 20 * S,
    backgroundColor: colors.border,
  },
  statVal: {
    fontFamily: fonts.sansBold,
    fontSize: 13 * S,
    color: colors.text,
  },
  statUnit: {
    fontFamily: fonts.sans,
    fontSize: 8 * S,
    color: colors.textMuted,
    marginTop: 1,
  },

  communityCard: {
    backgroundColor: '#FAFAF8',
    borderRadius: 10 * S,
    padding: 10 * S,
    marginBottom: 6 * S,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * S,
    marginBottom: 6 * S,
  },
  avatar: {
    width: 24 * S,
    height: 24 * S,
    borderRadius: 12 * S,
    backgroundColor: '#D4C8B8',
  },
  communityName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10 * S,
    color: colors.text,
  },
  communityMeta: {
    fontFamily: fonts.sans,
    fontSize: 8 * S,
    color: colors.textMuted,
    marginTop: 1,
  },
  communityBody: {
    fontFamily: fonts.sans,
    fontSize: 9 * S,
    lineHeight: 14 * S,
    color: colors.text,
    marginBottom: 6 * S,
  },
  communityActions: {
    flexDirection: 'row',
    gap: 12 * S,
  },
  communityAction: {
    fontFamily: fonts.sans,
    fontSize: 9 * S,
    color: colors.textMuted,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5 * S,
    paddingTop: 8 * S,
  },
  dot: {
    width: 5 * S,
    height: 5 * S,
    borderRadius: 3 * S,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.text,
  },
});
