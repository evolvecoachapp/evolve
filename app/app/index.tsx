import { Redirect } from "expo-router";
import { BootstrapSkeleton } from "../src/components/Skeleton";
import { useAuth } from "../src/auth/useAuth";
import { isBackendProfileComplete } from "../src/features/athlete-setup/isBackendProfileComplete";
import { useRuntimeSession } from "../src/runtime/session/RuntimeSessionContext";

/**
 * Entry route: shows a splash/loading indicator while `AuthProvider` checks
 * secure storage for an existing session, then redirects to athlete setup,
 * the authenticated Home screen, or Welcome.
 */
export default function Index() {
  const { isBootstrapping: isAuthBootstrapping, isAuthenticated, user } = useAuth();
  const { isStarting: isRuntimeStarting } = useRuntimeSession();

  if (isAuthBootstrapping || (isAuthenticated && isRuntimeStarting)) {
    return <BootstrapSkeleton />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return (
    <Redirect
      href={
        (isBackendProfileComplete(user) ? "/(app)/(tabs)" : "/(app)/setup") as never
      }
    />
  );
}
