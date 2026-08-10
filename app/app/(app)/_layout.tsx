import { Redirect, Stack } from "expo-router";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { useAuth } from "../../src/auth/useAuth";
import { useRuntimeSession } from "../../src/runtime/session/RuntimeSessionContext";
import { useTheme } from "../../src/theme/ThemeContext";

/**
 * Guards every route in the `(app)` group: unauthenticated users (and users
 * whose session verification failed during bootstrap) are bounced back to
 * onboarding rather than ever rendering an authenticated screen.
 */
export default function AppLayout() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping } = useAuth();
  const { isStarting: isRuntimeStarting } = useRuntimeSession();
  const { colors } = useTheme();

  if (!isAuthBootstrapping && !isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (isAuthBootstrapping || isRuntimeStarting) {
    return <LoadingSpinner color={colors.ink} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
