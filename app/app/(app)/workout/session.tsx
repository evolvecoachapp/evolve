import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { consumePendingSession } from "../../../src/features/workout/services";
import { WorkoutSessionScreen } from "../../../src/screens/WorkoutSessionScreen";

export default function WorkoutSessionRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  // Consumed once, on first render — the handoff slot is only ever populated
  // by the screen that just navigated here (Start/Resume Workout).
  const [initialSession] = useState(() => (sessionId ? consumePendingSession(sessionId) : null));

  if (!sessionId) {
    return null;
  }

  return (
    <WorkoutSessionScreen
      sessionId={sessionId}
      initialSession={initialSession ?? undefined}
    />
  );
}
