import { Stack } from 'expo-router';
import { lightColors } from '../../src/design-system';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: lightColors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
