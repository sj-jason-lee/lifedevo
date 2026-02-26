import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontFamily } from '../../constants/typography';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  const isOffline = isConnected === false;

  useEffect(() => {
    if (isOffline) {
      translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 350 });
    } else {
      translateY.value = withTiming(-60, { duration: 300, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: insets.top + 8 },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Feather name="wifi-off" size={14} color={Colors.textDark} />
      <Text style={styles.text}>You're offline</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 10,
    backgroundColor: Colors.accent,
  },
  text: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 13,
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
});
