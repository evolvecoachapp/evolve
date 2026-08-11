import { Redirect, Stack } from "expo-router";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";
import { RuntimeFailureScreen } from "../../src/components/RuntimeFailureScreen";
import { useAuth } from "../../src/auth/useAuth";
import { RUNTIME_SESSION_STATUS } from "../../src/runtime/session/RuntimeSessionStatus";
import { useRuntimeSession } from "../../src/runtime/session/RuntimeSessionContext";
import { useTheme } from "../../src/theme/ThemeContext";

/**
 * Guards every route in the `(app)` group: unauthenticated users (and users
 * whose session verification failed during bootstrap) are bounced back to
 * onboarding rather than ever rendering an authenticated screen. A failed
 * Runtime Session blocks authenticated navigation behind a dedicated global
 * recovery screen instead of rendering the tabs. The authenticated stack is
 * wrapped in a single `ErrorBoundary` — the smallest boundary that covers
 * the whole authenticated app shell without also covering auth/onboarding.
 */
export default function AppLayout() {
  const { isAuthenticated, isBootstrapping: isAuthBootstrapping } = useAuth();
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

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </ErrorBoundary>
  );
}
