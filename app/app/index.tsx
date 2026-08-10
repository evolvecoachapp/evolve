import { Redirect } from "expo-router";
import { BootstrapSkeleton } from "../src/components/Skeleton";
import { useAuth } from "../src/auth/useAuth";
import { useRuntimeBootstrap } from "../src/runtime/bootstrap/RuntimeBootstrapContext";

/**
 * Entry route: shows a splash/loading indicator while `AuthProvider` checks
 * secure storage for an existing session, then redirects to the
 * authenticated Home screen or the Welcome/onboarding screen accordingly.
 */
export default function Index() {
  const { isBootstrapping: isAuthBootstrapping, isAuthenticated } = useAuth();
  const { isBootstrapping: isRuntimeBootstrapping } = useRuntimeBootstrap();

  if (isAuthBootstrapping || (isAuthenticated && isRuntimeBootstrapping)) {
    return <BootstrapSkeleton />;
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(onboarding)/welcome"} />;
}
