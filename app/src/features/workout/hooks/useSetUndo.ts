import { useCallback, useEffect, useRef, useState } from "react";
import type { ExerciseSet } from "../models/ExerciseSet";

const DEFAULT_UNDO_WINDOW_MS = 4000;

export interface UndoableSet {
  exerciseId: string;
  setId: string;
  snapshot: ExerciseSet;
}

interface UseSetUndoResult {
  pendingUndo: UndoableSet | null;
  secondsRemaining: number;
  offerUndo: (item: UndoableSet) => void;
  dismissUndo: () => void;
}

/**
 * Manages a short undo window after completing a set.
 * The caller is responsible for reverting session state and calling the service.
 */
export function useSetUndo(windowMs = DEFAULT_UNDO_WINDOW_MS): UseSetUndoResult {
  const [pendingUndo, setPendingUndo] = useState<UndoableSet | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAtRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    expiresAtRef.current = null;
  }, []);

  const dismissUndo = useCallback(() => {
    clearTimers();
    setPendingUndo(null);
    setSecondsRemaining(0);
  }, [clearTimers]);

  const offerUndo = useCallback(
    (item: UndoableSet) => {
      clearTimers();
      const expiresAt = Date.now() + windowMs;
      expiresAtRef.current = expiresAt;
      setPendingUndo(item);
      setSecondsRemaining(Math.ceil(windowMs / 1000));

      intervalRef.current = setInterval(() => {
        if (expiresAtRef.current === null) {
          return;
        }
        const remainingMs = expiresAtRef.current - Date.now();
        const nextSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
        setSecondsRemaining(nextSeconds);
        if (nextSeconds <= 0) {
          dismissUndo();
        }
      }, 250);

      timeoutRef.current = setTimeout(() => {
        dismissUndo();
      }, windowMs);
    },
    [clearTimers, dismissUndo, windowMs],
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    pendingUndo,
    secondsRemaining,
    offerUndo,
    dismissUndo,
  };
}
