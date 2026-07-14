import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/auth/AuthContext";

/**
 * Root layout: mounts `AuthProvider` above the entire route tree so every
 * screen and group layout can call `useAuth()`. Route-level auth
 * redirection happens in `app/index.tsx` (initial bootstrap) and
 * `app/(app)/_layout.tsx` (guarding authenticated routes) — this layout
 * only wires up shared providers and global stack options.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
