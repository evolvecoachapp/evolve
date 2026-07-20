import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WorkoutSession } from "../../training/application";
import type { SessionExecutionState } from "../types/sessionExecutionState";
import type { SessionRestSnapshot, SessionRestStatus } from "../types/sessionTiming";
import {
  findFirstPendingSetId,
  findNextPendingSetId,
  shouldStartRestAfterComplete,
  withProvisionalSetStatus,
} from "../utils/sessionSetFlow";

const TICK_INTERVAL_MS = 250;

const IDLE_REST: SessionRestSnapshot = Object.freeze({
  status: "idle",
  secondsLeft: 0,
  totalSeconds: 0,
  sourceSetId: null,
  upcomingSetId: null,
});

export interface UseSessionTimingResult {
  /** Set the athlete should focus on (pending). Null when none remain. */
  activeSetId: string | null;
  /** Local rest countdown — completely in-memory. */
  rest: SessionRestSnapshot;
  pauseRest: () => void;
  resumeRest: () => void;
  skipRest: () => void;
  /**
   * Call after the execution overlay marks a set completed.
   * Starts rest for working sets when appropriate and advances active set.
   */
  afterSetCompleted: (setId: string) => void;
  /** Call after the execution overlay skips a set — no rest, advance focus. */
  afterSetSkipped: (setId: string) => void;
  /** Re-sync active set from execution (e.g. after undo / restore). */
  syncActiveSet: () => void;
}

/**
 * Dedicated local session timing hook.
 * Owns rest countdown (pause / resume / skip) and active-set selection.
 * Does not mutate `WorkoutSession` or the execution overlay.
 */
export function useSessionTiming(
  session: WorkoutSession,
  execution: SessionExecutionState,
): UseSessionTimingResult {
  const [activeSetId, setActiveSetId] = useState<string | null>(() =>
    findFirstPendingSetId(session, execution),
  );
  const [restStatus, setRestStatus] = useState<SessionRestStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sourceSetId, setSourceSetId] = useState<string | null>(null);
  const [upcomingSetId, setUpcomingSetId] = useState<string | null>(null);

  const endsAtRef = useRef<number | null>(null);
  const remainingMsRef = useRef(0);

  const clearRest = useCallback(() => {
    endsAtRef.current = null;
    remainingMsRef.current = 0;
    setRestStatus("idle");
    setSecondsLeft(0);
    setTotalSeconds(0);
    setSourceSetId(null);
    setUpcomingSetId(null);
  }, []);

  const selectPendingFocus = useCallback(
    (preferredAfterSetId: string | null = null) => {
      const next =
        preferredAfterSetId === null
          ? findFirstPendingSetId(session, execution)
          : findNextPendingSetId(session, execution, preferredAfterSetId);
      setActiveSetId(next);
      return next;
    },
    [execution, session],
  );

  const finishRest = useCallback(
    (advanceToUpcoming: boolean) => {
      const target = advanceToUpcoming ? upcomingSetId : null;
      clearRest();
      if (target !== null && getPendingStatus(execution, target)) {
        setActiveSetId(target);
        return;
      }
      selectPendingFocus(null);
    },
    [clearRest, execution, selectPendingFocus, upcomingSetId],
  );

  const startRest = useCallback(
    (durationSeconds: number, completedSetId: string, nextSetId: string) => {
      endsAtRef.current = Date.now() + durationSeconds * 1000;
      remainingMsRef.current = durationSeconds * 1000;
      setTotalSeconds(durationSeconds);
      setSecondsLeft(durationSeconds);
      setSourceSetId(completedSetId);
      setUpcomingSetId(nextSetId);
      setRestStatus("running");
      setActiveSetId(nextSetId);
    },
    [],
  );

  const afterSetCompleted = useCallback(
    (setId: string) => {
      // Interaction setState may not have flushed yet — treat this set as completed.
      const effective = withProvisionalSetStatus(execution, setId, "completed");
      const decision = shouldStartRestAfterComplete(session, effective, setId);
      if (decision.start) {
        startRest(decision.durationSeconds, setId, decision.upcomingSetId);
        return;
      }
      clearRest();
      const next = findNextPendingSetId(session, effective, setId);
      setActiveSetId(next);
    },
    [clearRest, execution, session, startRest],
  );

  const afterSetSkipped = useCallback(
    (setId: string) => {
      const effective = withProvisionalSetStatus(execution, setId, "skipped");
      clearRest();
      const next = findNextPendingSetId(session, effective, setId);
      setActiveSetId(next);
    },
    [clearRest, execution, session],
  );

  const syncActiveSet = useCallback(() => {
    if (restStatus !== "idle") {
      return;
    }
    if (activeSetId !== null && getPendingStatus(execution, activeSetId)) {
      return;
    }
    selectPendingFocus(null);
  }, [activeSetId, execution, restStatus, selectPendingFocus]);

  const pauseRest = useCallback(() => {
    if (restStatus !== "running" || endsAtRef.current === null) {
      return;
    }
    remainingMsRef.current = Math.max(0, endsAtRef.current - Date.now());
    endsAtRef.current = null;
    setSecondsLeft(Math.ceil(remainingMsRef.current / 1000));
    setRestStatus("paused");
  }, [restStatus]);

  const resumeRest = useCallback(() => {
    if (restStatus !== "paused" || remainingMsRef.current <= 0) {
      return;
    }
    endsAtRef.current = Date.now() + remainingMsRef.current;
    setRestStatus("running");
  }, [restStatus]);

  const skipRest = useCallback(() => {
    if (restStatus === "idle") {
      return;
    }
    finishRest(true);
  }, [finishRest, restStatus]);

  useEffect(() => {
    if (restStatus !== "running") {
      return;
    }

    const tick = () => {
      if (endsAtRef.current === null) {
        return;
      }

      const remainingMs = endsAtRef.current - Date.now();
      const nextSecondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
      remainingMsRef.current = Math.max(0, remainingMs);
      setSecondsLeft(nextSecondsLeft);

      if (nextSecondsLeft <= 0) {
        finishRest(true);
      }
    };

    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [finishRest, restStatus]);

  // Keep focus valid when execution changes externally (undo / restore).
  useEffect(() => {
    syncActiveSet();
  }, [execution, syncActiveSet]);

  const rest = useMemo<SessionRestSnapshot>(
    () =>
      restStatus === "idle"
        ? IDLE_REST
        : {
            status: restStatus,
            secondsLeft,
            totalSeconds,
            sourceSetId,
            upcomingSetId,
          },
    [restStatus, secondsLeft, sourceSetId, totalSeconds, upcomingSetId],
  );

  return {
    activeSetId,
    rest,
    pauseRest,
    resumeRest,
    skipRest,
    afterSetCompleted,
    afterSetSkipped,
    syncActiveSet,
  };
}

function getPendingStatus(execution: SessionExecutionState, setId: string): boolean {
  return (execution.sets[setId]?.status ?? "pending") === "pending";
}
