import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { consumePendingSessionSummary } from "../../../src/features/workout/services";
import { WorkoutSessionCompleteScreen } from "../../../src/screens/WorkoutSessionCompleteScreen";

export default function WorkoutSessionCompleteRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const [summary] = useState(() =>
    sessionId ? consumePendingSessionSummary(sessionId) : null,
  );

  if (!sessionId) {
    return null;
  }

  return <WorkoutSessionCompleteScreen summary={summary} />;
}
