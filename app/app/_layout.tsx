import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/auth/AuthContext";
import { ThemeProvider, useStatusBarStyle } from "../src/theme/ThemeContext";
import { useEffect } from "react";
import { initializeEventSystem } from "../src/features/events/bootstrap";

function RootStatusBar() {
  const statusBarStyle = useStatusBarStyle();
  return <StatusBar style={statusBarStyle} />;
}

/**
 * Root layout: mounts shared providers above the entire route tree.
 * Route-level auth redirection happens in `app/index.tsx` and
 * `app/(app)/_layout.tsx` — this layout only wires providers and stack options.
 */
export default function RootLayout() {
  useEffect(() => {
    initializeEventSystem();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootStatusBar />
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
