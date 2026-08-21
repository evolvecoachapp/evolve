import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/auth/useAuth";
import {
  AthleteSetupScreen,
  completeAthleteSetup,
  type AthleteSetupValues,
} from "../../../src/features/athlete-setup";

export default function AthleteSetupRoute() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async (values: AthleteSetupValues) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await completeAthleteSetup(values);
      await refreshUser();
      router.replace("/(app)/(tabs)");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not save your athlete profile.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AthleteSetupScreen
      onComplete={handleComplete}
      submitError={submitError}
      submitting={submitting}
    />
  );
}
