import type { WorkoutRuntime } from "../models/WorkoutRuntime";
import { isTerminalWorkoutState } from "../models/WorkoutState";
import { validateStateTransition } from "./validateStateTransition";

/**
 * Validate high-level runtime operations against current state.
 */
export function validateStartOperation(
  runtime: WorkoutRuntime | null,
): readonly string[] {
  if (runtime === null) {
    return Object.freeze([]);
  }
  if (runtime.state !== "NotStarted") {
    return Object.freeze([`already_started:${runtime.state}`]);
  }
  return Object.freeze([]);
}

export function validatePauseOperation(
  runtime: WorkoutRuntime,
): readonly string[] {
  return validateStateTransition(runtime.state, "Paused");
}

export function validateResumeOperation(
  runtime: WorkoutRuntime,
): readonly string[] {
  return validateStateTransition(runtime.state, "Running");
}

export function validateCancelOperation(
  runtime: WorkoutRuntime,
): readonly string[] {
  return validateStateTransition(runtime.state, "Cancelled");
}

export function validateCompleteOperation(
  runtime: WorkoutRuntime,
): readonly string[] {
  return validateStateTransition(runtime.state, "Completed");
}

export function validateMutationAllowed(
  runtime: WorkoutRuntime,
): readonly string[] {
  if (isTerminalWorkoutState(runtime.state)) {
    return Object.freeze([`terminal_state:${runtime.state}`]);
  }
  if (runtime.state !== "Running") {
    return Object.freeze([`mutation_requires_running:${runtime.state}`]);
  }
  return Object.freeze([]);
}
