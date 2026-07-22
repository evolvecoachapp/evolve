/**
 * Runtime configuration knobs (no timers, no networking).
 */
export interface WorkoutRuntimeConfiguration {
  /** When true, skipping the last remaining exercise completes the workout. */
  readonly autoCompleteOnLastExerciseSkip: boolean;
  /** When true, finishing the last set of the last exercise completes the workout. */
  readonly autoCompleteOnLastSet: boolean;
  /** Fixed ISO timestamp override for deterministic tests (null = use provided/now). */
  readonly fixedTimestamp: string | null;
}

export const DEFAULT_WORKOUT_RUNTIME_CONFIGURATION: WorkoutRuntimeConfiguration =
  Object.freeze({
    autoCompleteOnLastExerciseSkip: true,
    autoCompleteOnLastSet: true,
    fixedTimestamp: null,
  });
