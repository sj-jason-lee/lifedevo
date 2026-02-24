import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function ChurchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.primary },
      }}
    />
  );
}
