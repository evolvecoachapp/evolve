import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_REST_SECONDS = 90;
const ADJUST_STEP_SECONDS = 10;
const TICK_INTERVAL_MS = 250;

/**
 * Feedback hook points for a running rest countdown — intentionally
 * unimplemented in Phase 1. Wire these to `expo-haptics`/audio cues later,
 * gated by `WorkoutPreferences.hapticFeedbackEnabled` / `.soundEnabled`.
 */
export interface RestTimerEvents {
  /** Fires once when the countdown reaches zero on its own (not via skip). */
  onComplete?: () => void;
  /** Fires on every tick with the current remaining seconds. */
  onTick?: (secondsLeft: number) => void;
  /** Fires when the user taps Skip Rest. */
  onSkip?: () => void;
  /** Fires when the user adjusts the timer via +10/-10, with the resulting remaining seconds. */
  onAdjust?: (deltaSeconds: number, secondsLeft: number) => void;
}

interface UseRestTimerOptions {
  events?: RestTimerEvents;
}

/**
 * Manages an automatic rest countdown. Timestamp-based (`endsAt`) rather than
 * a plain decrementing counter, so the displayed time stays accurate across
 * app background/foreground transitions instead of drifting or pausing.
 */
export function useRestTimer({ events }: UseRestTimerOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_REST_SECONDS);
  const endsAtRef = useRef<number | null>(null);
  const eventsRef = useRef<RestTimerEvents | undefined>(events);
  eventsRef.current = events;

  const clearToIdle = useCallback(() => {
    endsAtRef.current = null;
    setIsActive(false);
    setSecondsLeft(0);
  }, []);

  /** Starts (or restarts) the countdown for the given duration, falling back to the default when unset. */
  const start = useCallback((seconds: number | null) => {
    const duration = seconds && seconds > 0 ? seconds : DEFAULT_REST_SECONDS;
    endsAtRef.current = Date.now() + duration * 1000;
    setTotalSeconds(duration);
    setSecondsLeft(duration);
    setIsActive(true);
  }, []);

  const skip = useCallback(() => {
    if (!isActive) {
      return;
    }
    clearToIdle();
    eventsRef.current?.onSkip?.();
  }, [clearToIdle, isActive]);

  const adjustSeconds = useCallback(
    (deltaSeconds: number) => {
      if (!isActive || endsAtRef.current === null) {
        return;
      }

      const remainingMs = Math.max(0, endsAtRef.current - Date.now());
      const nextSecondsLeft = Math.max(0, Math.round(remainingMs / 1000) + deltaSeconds);

      if (nextSecondsLeft <= 0) {
        clearToIdle();
        eventsRef.current?.onAdjust?.(deltaSeconds, 0);
        eventsRef.current?.onComplete?.();
        return;
      }

      endsAtRef.current = Date.now() + nextSecondsLeft * 1000;
      setTotalSeconds((current) => Math.max(current, nextSecondsLeft));
      setSecondsLeft(nextSecondsLeft);
      eventsRef.current?.onAdjust?.(deltaSeconds, nextSecondsLeft);
    },
    [clearToIdle, isActive],
  );

  const addTenSeconds = useCallback(() => adjustSeconds(ADJUST_STEP_SECONDS), [adjustSeconds]);
  const subtractTenSeconds = useCallback(() => adjustSeconds(-ADJUST_STEP_SECONDS), [adjustSeconds]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const tick = () => {
      if (endsAtRef.current === null) {
        return;
      }

      const remainingMs = endsAtRef.current - Date.now();
      const nextSecondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));

      setSecondsLeft(nextSecondsLeft);
      eventsRef.current?.onTick?.(nextSecondsLeft);

      if (nextSecondsLeft <= 0) {
        clearToIdle();
        eventsRef.current?.onComplete?.();
      }
    };

    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [clearToIdle, isActive]);

  return {
    isActive,
    secondsLeft,
    totalSeconds,
    start,
    skip,
    addTenSeconds,
    subtractTenSeconds,
  };
}
