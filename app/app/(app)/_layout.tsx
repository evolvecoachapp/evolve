import { Redirect, Stack } from "expo-router";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { useAuth } from "../../src/auth/useAuth";
import { useRuntimeBootstrap } from "../../src/runtime/bootstrap/RuntimeBootstrapContext";
import { useTheme } from "../../src/theme/ThemeContext";

/**
 * Guards every route in the `(app)` group: unauthenticated users (and users
 * whose session verification failed during bootstrap) are bounced back to
 * onboarding rather than ever rendering an authenticated screen.
 */
export default function AppLayout() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping } = useAuth();
  const { isBootstrapping: isRuntimeBootstrapping } = useRuntimeBootstrap();
  const { colors } = useTheme();

  if (!isAuthBootstrapping && !isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (isAuthBootstrapping || isRuntimeBootstrapping) {
    return <LoadingSpinner color={colors.ink} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
