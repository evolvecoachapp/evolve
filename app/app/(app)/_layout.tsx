import { Redirect, Stack } from "expo-router";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { useAuth } from "../../src/auth/useAuth";
import { colors } from "../../src/theme/theme";

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

  if (isBootstrapping) {
    return <LoadingSpinner color={colors.primary} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
