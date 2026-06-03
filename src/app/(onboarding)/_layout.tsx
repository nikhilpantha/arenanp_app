import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="role"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="role" />
      <Stack.Screen name="player/sports" />
      <Stack.Screen name="venue/create" />
    </Stack>
  );
}
