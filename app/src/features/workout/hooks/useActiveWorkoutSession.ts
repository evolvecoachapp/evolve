import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import { workoutService } from "../services";
import type { FinishWorkoutOptions, WorkoutService } from "../types/workoutService";
import {
  findNextIncompleteSet,
  isSessionComplete,
  mergeSavedSetIntoSession,
  revertSavedSetInSession,
  type SessionPosition,
} from "../utils/sessionSelectors";
import { useRestFeedback } from "./useRestFeedback";
import { useRestTimer } from "./useRestTimer";
import { useSetUndo } from "./useSetUndo";

const ELAPSED_TICK_MS = 1000;

interface UseActiveWorkoutSessionOptions {
  sessionId: string;
  initialSession?: WorkoutSession;
  service?: WorkoutService;
}

function parseWeightInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseRepsInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Most recently logged working set that precedes `setIndex` within the same exercise, if any. */
function findPreviousLoggedSet(exercise: SessionPosition["exercise"], setIndex: number) {
  for (let index = setIndex - 1; index >= 0; index -= 1) {
    const candidate = exercise.workingSets[index];
    if (candidate.completed) {
      return candidate;
    }
  }
  return null;
}

/**
 * Manages an in-progress workout session — set logging, rest timing, undo,
 * and finish.
 */
export function useActiveWorkoutSession({
  sessionId,
  initialSession,
  service = workoutService,
}: UseActiveWorkoutSessionOptions) {
  const [session, setSession] = useState<WorkoutSession | null>(initialSession ?? null);
  const [loading, setLoading] = useState(!initialSession);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [weightAutoFilled, setWeightAutoFilled] = useState(false);
  const [finishNotes, setFinishNotes] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const positionRef = useRef<SessionPosition | null>(null);
  const restFeedback = useRestFeedback();
  const restTimer = useRestTimer({ events: restFeedback });
  const setUndo = useSetUndo();

  const refreshSession = useCallback(async () => {
    const nextSession = await service.getSession(sessionId);
    if (!nextSession) {
      throw new Error("Workout session not found.");
    }
    setSession(nextSession);
    return nextSession;
  }, [service, sessionId]);

  useEffect(() => {
    if (initialSession) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const nextSession = await service.getSession(sessionId);
        if (cancelled) {
          return;
        }
        if (!nextSession) {
          setError("Workout session not found.");
          setSession(null);
          return;
        }
        setSession(nextSession);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load session.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialSession, service, sessionId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshSession().catch(() => {});
      }
    });

    return () => subscription.remove();
  }, [refreshSession]);

  useEffect(() => {
    if (!session?.startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const startedAtMs = new Date(session.startedAt).getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    tick();

    const interval = setInterval(tick, ELAPSED_TICK_MS);
    return () => clearInterval(interval);
  }, [session?.startedAt]);

  const position = useMemo(() => (session ? findNextIncompleteSet(session) : null), [session]);
  positionRef.current = position;

  useEffect(() => {
    if (!position || restTimer.isActive) {
      return;
    }

    const previousSet = findPreviousLoggedSet(position.exercise, position.setIndex);
    const autoWeight = previousSet?.completedWeight ?? null;
    const nextWeight = autoWeight ?? position.set.targetWeight;
    const nextReps = previousSet?.completedReps ?? position.set.targetReps;

    setWeightInput(nextWeight?.toString() ?? "");
    setRepsInput(nextReps?.toString() ?? "");
    setWeightAutoFilled(autoWeight !== null);
    setInputError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-seed only when the position moves, not on every render.
  }, [restTimer.isActive, position?.exercise.id, position?.set.id]);

  const completeSet = useCallback(async () => {
    const currentPosition = positionRef.current;
    if (!session || !currentPosition || saving || restTimer.isActive) {
      return;
    }

    const completedReps = parseRepsInput(repsInput);
    const completedWeight = parseWeightInput(weightInput);

    if (completedReps === null) {
      setInputError("Enter a valid rep count.");
      return;
    }

    setSaving(true);
    setInputError(null);
    const snapshot = { ...currentPosition.set };

    try {
      const saved = await service.saveSet({
        sessionId: session.id,
        exerciseId: currentPosition.exercise.id,
        setId: currentPosition.set.id,
        completedReps,
        completedWeight,
        rpe: null,
        completed: true,
      });

      const mergedSession = saved
        ? mergeSavedSetIntoSession(session, currentPosition.exercise.id, currentPosition.set.id, saved)
        : session;

      setSession(mergedSession);

      setUndo.offerUndo({
        exerciseId: currentPosition.exercise.id,
        setId: saved?.id ?? currentPosition.set.id,
        snapshot,
      });

      const nextPosition = findNextIncompleteSet(mergedSession);
      if (nextPosition) {
        restTimer.start(currentPosition.set.restSeconds);
      }
    } catch (saveError) {
      setInputError(saveError instanceof Error ? saveError.message : "Failed to save set.");
      void refreshSession().catch(() => {});
    } finally {
      setSaving(false);
    }
  }, [refreshSession, repsInput, restTimer, saving, service, session, setUndo, weightInput]);

  const undoLastSet = useCallback(async () => {
    const undoItem = setUndo.pendingUndo;
    if (!session || !undoItem || saving) {
      return;
    }

    setSaving(true);
    setInputError(null);
    restTimer.skip();
    setUndo.dismissUndo();

    try {
      await service.saveSet({
        sessionId: session.id,
        exerciseId: undoItem.exerciseId,
        setId: undoItem.setId,
        completedReps: null,
        completedWeight: null,
        rpe: null,
        completed: false,
      });

      setSession(revertSavedSetInSession(session, undoItem.exerciseId, undoItem.setId, undoItem.snapshot));
    } catch (undoError) {
      setInputError(undoError instanceof Error ? undoError.message : "Failed to undo set.");
      void refreshSession().catch(() => {});
    } finally {
      setSaving(false);
    }
  }, [refreshSession, restTimer, saving, service, session, setUndo]);

  const finishWorkout = useCallback(
    async (options?: FinishWorkoutOptions): Promise<WorkoutSummary | null> => {
      if (!session || finishing) {
        return null;
      }

      setFinishing(true);
      setError(null);

      const notes = options?.notes ?? (finishNotes.trim() || null);

      try {
        const summary = await service.finishWorkout(session.id, { notes });
        return summary;
      } catch (finishError) {
        setError(finishError instanceof Error ? finishError.message : "Failed to finish workout.");
        return null;
      } finally {
        setFinishing(false);
      }
    },
    [finishNotes, finishing, service, session],
  );

  return {
    session,
    loading,
    error,
    saving,
    finishing,
    inputError,
    weightInput,
    repsInput,
    weightAutoFilled,
    finishNotes,
    setWeightInput,
    setRepsInput,
    setFinishNotes,
    position,
    elapsedSeconds,
    isResting: restTimer.isActive,
    restSecondsLeft: restTimer.secondsLeft,
    restDurationSeconds: restTimer.totalSeconds,
    skipRest: restTimer.skip,
    addRestSeconds: restTimer.addTenSeconds,
    subtractRestSeconds: restTimer.subtractTenSeconds,
    isComplete: session ? isSessionComplete(session) : false,
    pendingUndo: setUndo.pendingUndo,
    undoSecondsRemaining: setUndo.secondsRemaining,
    completeSet,
    undoLastSet,
    dismissUndo: setUndo.dismissUndo,
    finishWorkout,
  };
}
