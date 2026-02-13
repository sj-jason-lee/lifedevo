import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  route: RouteProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ route }: Props) {
  const { role, name } = route.params;
  const roleLabel = role === 'reader' ? 'Reader' : 'Shepherd';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const chipAnim = useRef(new Animated.Value(0)).current;
  const subAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(chipAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.Text
          style={[
            styles.brand,
            {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
            },
          ]}
        >
          pasture
        </Animated.Text>
        <Animated.Text
          style={[
            styles.greeting,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          Welcome, {name}
        </Animated.Text>
        <Animated.View
          style={[
            styles.roleChip,
            {
              opacity: chipAnim,
              transform: [
                { translateY: chipAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                { scale: chipAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
              ],
            },
          ]}
        >
          <Text style={styles.roleText}>
            {role === 'reader' ? '📖' : '🌿'} {roleLabel}
          </Text>
        </Animated.View>
        <Animated.Text
          style={[
            styles.sub,
            {
              opacity: subAnim,
              transform: [{ translateY: subAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            },
          ]}
        >
          Your home screen is coming soon.
        </Animated.Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.green,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  roleChip: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  roleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.green,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textMuted,
  },
});
