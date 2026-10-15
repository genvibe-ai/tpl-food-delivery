import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { AppFrame } from "@/components/AppFrame";
import { Overlays } from "@/components/Overlays";
import { palette } from "@/constants/content";
import { fontFiles } from "@/lib/fonts";
import { useHydrated } from "@/lib/store";

SplashScreen.preventAutoHideAsync().catch(() => {});
// The design is light-only (react-native-web has no setColorScheme).
if (Platform.OS !== "web") Appearance.setColorScheme("light");
SystemUI.setBackgroundColorAsync(palette.canvas).catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const hydrated = useHydrated();
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.canvas }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <StatusBar style="dark" />
          <AppFrame>
            {ready ? (
              <>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.canvas } }}>
                  <Stack.Screen name="index" options={{ animation: "none" }} />
                  <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
                  <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
                  <Stack.Screen name="restaurant/[id]" />
                  <Stack.Screen name="bag" options={{ animation: "slide_from_bottom" }} />
                  <Stack.Screen name="checkout" />
                  <Stack.Screen name="order/[id]" options={{ animation: "slide_from_bottom" }} />
                  <Stack.Screen name="address" options={{ animation: "slide_from_bottom" }} />
                </Stack>
                <Overlays />
              </>
            ) : null}
          </AppFrame>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
