import type { RestRuntime } from "../models/RestRuntime";
import { isTerminalRestState } from "../models/RestState";

export function validateStartOperation(
  runtime: RestRuntime | null,
): readonly string[] {
  if (runtime !== null && runtime.state !== "Idle") {
    return Object.freeze([`already_started:${runtime.state}`]);
  }
  return Object.freeze([]);
}

export function validatePauseOperation(
  runtime: RestRuntime,
): readonly string[] {
  if (runtime.state !== "Running") {
    return Object.freeze([`cannot_pause_from:${runtime.state}`]);
  }
  return Object.freeze([]);
}

export function validateResumeOperation(
  runtime: RestRuntime,
): readonly string[] {
  if (runtime.state !== "Paused") {
    return Object.freeze([`cannot_resume_from:${runtime.state}`]);
  }
  return Object.freeze([]);
}

export function validateCancelOperation(
  runtime: RestRuntime,
): readonly string[] {
  if (isTerminalRestState(runtime.state)) {
    return Object.freeze([`already_terminal:${runtime.state}`]);
  }
  if (
    runtime.state !== "Idle" &&
    runtime.state !== "Running" &&
    runtime.state !== "Paused"
  ) {
    return Object.freeze([`cannot_cancel_from:${runtime.state}`]);
  }
  return Object.freeze([]);
}

export function validateCompleteOperation(
  runtime: RestRuntime,
): readonly string[] {
  if (runtime.state !== "Running" && runtime.state !== "Paused") {
    return Object.freeze([`cannot_complete_from:${runtime.state}`]);
  }
  return Object.freeze([]);
}

export function validateElapsedUpdateOperation(
  runtime: RestRuntime,
): readonly string[] {
  if (runtime.state !== "Running") {
    return Object.freeze([`cannot_update_elapsed_from:${runtime.state}`]);
  }
  return Object.freeze([]);
}
