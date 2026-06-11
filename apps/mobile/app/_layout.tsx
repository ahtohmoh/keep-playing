import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '@/constants/Theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={THEME.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.bg },
          animation: 'fade',
        }}
      />
    </>
  );
}
