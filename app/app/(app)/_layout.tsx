import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";

/**
 * Guards every route in the `(app)` group: unauthenticated users (and users
 * whose session verification failed during bootstrap) are bounced back to
 * onboarding rather than ever rendering an authenticated screen.
 */
export default function AppLayout() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (!isBootstrapping && !isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
