import { Redirect } from "expo-router";
import { LoadingSpinner } from "../src/components/LoadingSpinner";
import { useAuth } from "../src/auth/useAuth";
import { colors } from "../src/theme/theme";

/**
 * Entry route: shows a splash/loading indicator while `AuthProvider` checks
 * secure storage for an existing session, then redirects to the
 * authenticated Home screen or the Welcome/onboarding screen accordingly.
 */
export default function Index() {
  const { isBootstrapping, isAuthenticated } = useAuth();

  if (isBootstrapping) {
    return <LoadingSpinner color={colors.primary} />;
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(onboarding)/welcome"} />;
}
