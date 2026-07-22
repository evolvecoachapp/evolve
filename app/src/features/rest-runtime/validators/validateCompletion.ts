import type { RestRuntime } from "../models/RestRuntime";
import { isTerminalRestState } from "../models/RestState";

/**
 * Validate whether rest may be manually completed.
 */
export function validateRestCompletion(
  runtime: RestRuntime,
): readonly string[] {
  if (isTerminalRestState(runtime.state)) {
    return Object.freeze([`already_terminal:${runtime.state}`]);
  }
  if (runtime.state !== "Running" && runtime.state !== "Paused") {
    return Object.freeze([`cannot_complete_from:${runtime.state}`]);
  }
  return Object.freeze([]);
}

/**
 * Validate whether rest may expire (target reached).
 */
export function validateRestExpiration(
  runtime: RestRuntime,
): readonly string[] {
  if (isTerminalRestState(runtime.state)) {
    return Object.freeze([`already_terminal:${runtime.state}`]);
  }
  if (runtime.state !== "Running" && runtime.state !== "Paused") {
    return Object.freeze([`cannot_expire_from:${runtime.state}`]);
  }
  if (runtime.progress.elapsedMs < runtime.configuration.targetDurationMs) {
    return Object.freeze([
      `target_not_reached:${runtime.progress.elapsedMs}<${runtime.configuration.targetDurationMs}`,
    ]);
  }
  return Object.freeze([]);
}

/**
 * Whether auto-expire should fire for the given elapsed value.
 */
export function shouldAutoExpire(
  runtime: RestRuntime,
  elapsedMs: number,
): boolean {
  return (
    runtime.configuration.autoExpireOnTarget &&
    runtime.state === "Running" &&
    elapsedMs >= runtime.configuration.targetDurationMs
  );
}
