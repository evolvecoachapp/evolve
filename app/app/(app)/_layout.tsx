import { Redirect, Stack, useSegments } from "expo-router";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { RuntimeFailureScreen } from "../../src/components/RuntimeFailureScreen";
import { useAuth } from "../../src/auth/useAuth";
import { isBackendProfileComplete } from "../../src/features/athlete-setup";
import { RUNTIME_SESSION_STATUS } from "../../src/runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../src/runtime/session/RuntimeSessionContext";
import { useTheme } from "../../src/theme/ThemeContext";

/**
 * Guards every route in the `(app)` group: unauthenticated users (and users
 * whose session verification failed during bootstrap) are bounced back to
 * onboarding rather than ever rendering an authenticated screen. Incomplete
 * backend profiles are guided through `/(app)/setup` before the tab shell.
 * A failed Runtime Session blocks authenticated navigation behind a dedicated
 * global recovery screen. The authenticated stack is wrapped in a single
 * `ErrorBoundary`.
 */
export default function AppLayout() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping, user } = useAuth();
  const segments = useSegments();
  const {
    isStarting: isRuntimeStarting,
    status: runtimeStatus,
    retrySession,
  } = useRuntimeSession();
  const { colors } = useTheme();

  if (!isAuthBootstrapping && !isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (isAuthBootstrapping || isRuntimeStarting) {
    return <LoadingSpinner color={colors.ink} />;
  }

  if (runtimeStatus === RUNTIME_SESSION_STATUS.failed) {
    return <RuntimeFailureScreen onRetry={retrySession} />;
  }

  const onSetup = (segments as readonly string[]).includes("setup");
  if (user && !isBackendProfileComplete(user) && !onSetup) {
    return <Redirect href={"/(app)/setup" as never} />;
  }

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </ErrorBoundary>
  );
}

