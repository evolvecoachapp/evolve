import { useCallback, useRef } from "react";
import type { WorkoutSession } from "../../training/application";
import { persistCompletedSession } from "../application";
import type {
  SessionExecutionState,
  SessionInteractionStatus,
} from "../types/sessionExecutionState";
import type { WorkoutSessionSummary } from "../types/workoutSessionSummary";
import { buildWorkoutSessionSummary } from "../utils/buildWorkoutSessionSummary";

export interface UseSessionFinishResult {
  /** True when every set is completed or skipped. */
  canFinish: boolean;
  /** Builds a local summary from the immutable session + execution overlay. */
  buildSummary: () => WorkoutSessionSummary;
}

/**
 * Local finish helpers for the interactive session screen.
 * Tracks wall-clock start on mount; does not mutate `WorkoutSession`.
 * After the summary is built, persists a `CompletedWorkout` via the
 * application layer (fire-and-forget — never blocks navigation).
 */
export function useSessionFinish(
  session: WorkoutSession,
  execution: SessionExecutionState,
  interactionStatus: SessionInteractionStatus,
): UseSessionFinishResult {
  const startedAtRef = useRef(new Date().toISOString());

  const buildSummary = useCallback(() => {
    const summary = buildWorkoutSessionSummary(session, execution, {
      startedAt: startedAtRef.current,
    });
    void persistCompletedSession(summary).catch(() => {
      // Persistence must not interrupt the finish → complete navigation.
    });
    return summary;
  }, [session, execution]);

  return {
    canFinish: interactionStatus === "completed",
    buildSummary,
  };
}
