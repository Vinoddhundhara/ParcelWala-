import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ToastProvider } from '../src/components/common/Toast';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: 'splash',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ToastProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/otp" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/profile-setup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Multi-step Booking Screens */}
        <Stack.Screen name="booking/pickup" options={{ headerShown: false }} />
        <Stack.Screen name="booking/drop" options={{ headerShown: false }} />
        <Stack.Screen name="booking/parcel" options={{ headerShown: false }} />
        <Stack.Screen name="booking/delivery-options" options={{ headerShown: false }} />
        <Stack.Screen name="booking/review" options={{ headerShown: false }} />
        <Stack.Screen name="booking/payment" options={{ headerShown: false }} />
        <Stack.Screen name="booking/confirmation" options={{ headerShown: false }} />

        {/* Orders Screens */}
        <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="orders/cancel" options={{ headerShown: false }} />

        {/* Addresses & Support */}
        <Stack.Screen name="addresses/index" options={{ headerShown: false }} />
        <Stack.Screen name="addresses/new" options={{ headerShown: false }} />
        <Stack.Screen name="support/index" options={{ headerShown: false }} />
      </Stack>
    </ToastProvider>
  );
}
