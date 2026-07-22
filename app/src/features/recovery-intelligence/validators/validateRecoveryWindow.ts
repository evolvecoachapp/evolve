import type { RecoveryWindow } from "../models/RecoveryWindow";
import { parseTimestamp } from "../utils/formatting";
import { checkNonNegative } from "./validateNegativeValues";

/**
 * Validate recovery window bounds and duration consistency.
 */
export function validateRecoveryWindow(
  window: RecoveryWindow,
): readonly string[] {
  const issues: string[] = [];

  checkNonNegative("durationHours", window.durationHours, issues);
  checkNonNegative("durationMs", window.durationMs, issues);

  const start = parseTimestamp(window.startAt);
  const end = parseTimestamp(window.endAt);

  if (start === null) {
    issues.push("invalid_timestamp:recoveryWindow.startAt");
  }
  if (end === null) {
    issues.push("invalid_timestamp:recoveryWindow.endAt");
  }
  if (start !== null && end !== null && end < start) {
    issues.push("recovery_window_end_before_start");
  }
  if (
    start !== null &&
    end !== null &&
    window.durationMs > 0 &&
    Math.abs(end - start - window.durationMs) > 1
  ) {
    issues.push("recovery_window_duration_mismatch");
  }
  if (window.durationHours > 0 && window.durationMs !== window.durationHours * 3_600_000) {
    issues.push("recovery_window_hours_ms_mismatch");
  }

  return Object.freeze(issues);
}
