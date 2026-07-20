import { useCallback, useMemo } from "react";
import {
  WorkoutSessionBuilder,
  type WorkoutPreviewDay,
  type WorkoutProgramPreview,
  type WorkoutSession,
} from "../../training/application";

interface UseStartWorkoutSessionOptions {
  /** Injected builder — useful for tests. */
  builder?: WorkoutSessionBuilder;
}

interface UseStartWorkoutSessionResult {
  /**
   * Project the selected preview day into an executable session via the
   * application-layer builder. Does not construct session fields in React.
   */
  startSession: (preview: WorkoutProgramPreview, day: WorkoutPreviewDay) => WorkoutSession;
  /** Whether the selected day can be started (non-rest training day). */
  canStart: (day: WorkoutPreviewDay | null) => boolean;
}

/**
 * Thin React seam over `WorkoutSessionBuilder`.
 * Session creation stays in the application layer; this hook only invokes it.
 */
export function useStartWorkoutSession({
  builder,
}: UseStartWorkoutSessionOptions = {}): UseStartWorkoutSessionResult {
  const resolvedBuilder = useMemo(
    () => builder ?? new WorkoutSessionBuilder(),
    [builder],
  );

  const startSession = useCallback(
    (preview: WorkoutProgramPreview, day: WorkoutPreviewDay): WorkoutSession =>
      resolvedBuilder.build(preview, day),
    [resolvedBuilder],
  );

  const canStart = useCallback((day: WorkoutPreviewDay | null): boolean => {
    return day !== null && !day.isRestDay && day.exercises.length > 0;
  }, []);

  return { startSession, canStart };
}
