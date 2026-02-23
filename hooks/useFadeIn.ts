import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Config } from '../constants/config';

export const useFadeIn = (delay: number = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(Config.animation.entrance.translateY);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: Config.animation.entrance.duration,
        easing: Easing.out(Easing.cubic),
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: Config.animation.entrance.duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};
