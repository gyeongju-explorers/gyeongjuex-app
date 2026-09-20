import '@/global.css';

import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { hydrateSession } from '@/api/session';
import WebFrame from '@/components/global/WebFrame';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'GmarketSans-Light': require('../../assets/fonts/GmarketSans-Light.otf'),
    'GmarketSans-Medium': require('../../assets/fonts/GmarketSans-Medium.otf'),
    'GmarketSans-Bold': require('../../assets/fonts/GmarketSans-Bold.otf'),
  });
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    hydrateSession().finally(() => setSessionReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && sessionReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, sessionReady]);

  if ((!fontsLoaded && !fontError) || !sessionReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <WebFrame>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
          </Stack>
        </WebFrame>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
