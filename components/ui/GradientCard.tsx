import { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Config } from '../../constants/config';

interface GradientCardProps {
  children: ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
}

export const GradientCard = ({
  children,
  colors = [Colors.surfaceElevated, Colors.surfaceCard],
  style,
}: GradientCardProps): JSX.Element => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Config.radius.lg,
    padding: Config.spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
