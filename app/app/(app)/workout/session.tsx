import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { consumePendingExecutableSession } from "../../../src/features/workout/services";
import { WorkoutSessionScreen } from "../../../src/screens/WorkoutSessionScreen";

export default function WorkoutSessionRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  // Consumed once, on first render — the handoff slot is only ever populated
  // by WorkoutScreen when the user presses Start Workout.
  const [session] = useState(() =>
    sessionId ? consumePendingExecutableSession(sessionId) : null,
  );

  if (!sessionId) {
    return null;
  }

  return <WorkoutSessionScreen sessionId={sessionId} session={session} />;
}
