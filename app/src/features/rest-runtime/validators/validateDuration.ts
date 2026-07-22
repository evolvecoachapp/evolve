import type { RestConfiguration } from "../models/RestConfiguration";
import type { RestSession } from "../models/RestSession";

/**
 * Validate duration consistency and reject negatives / non-finite values.
 */
export function validateDurationMs(durationMs: number): readonly string[] {
  if (!Number.isFinite(durationMs)) {
    return Object.freeze([`non_finite_duration:${durationMs}`]);
  }
  if (durationMs < 0) {
    return Object.freeze([`negative_duration:${durationMs}`]);
  }
  return Object.freeze([]);
}

/**
 * Validate that configuration durations are consistent.
 */
export function validateConfigurationDurations(
  configuration: RestConfiguration,
): readonly string[] {
  const issues = [...validateDurationMs(configuration.targetDurationMs)];
  if (configuration.targetDurationMs === 0) {
    issues.push("zero_target_duration");
  }
  return Object.freeze(issues);
}

/**
 * Validate RestSession target vs configuration alignment.
 */
export function validateSessionDurations(
  session: RestSession,
  configuration: RestConfiguration,
): readonly string[] {
  const issues = [
    ...validateDurationMs(session.target.duration.milliseconds),
    ...validateConfigurationDurations(configuration),
  ];

  if (session.target.duration.milliseconds === 0) {
    issues.push("zero_session_target");
  }

  if (
    session.target.duration.milliseconds !== configuration.targetDurationMs
  ) {
    issues.push(
      `target_mismatch:session=${session.target.duration.milliseconds}:config=${configuration.targetDurationMs}`,
    );
  }

  return Object.freeze(issues);
}

/**
 * Validate an injected elapsed update against current elapsed.
 */
export function validateElapsedUpdate(
  currentElapsedMs: number,
  nextElapsedMs: number,
): readonly string[] {
  const issues = [...validateDurationMs(nextElapsedMs)];
  if (nextElapsedMs < currentElapsedMs) {
    issues.push(
      `elapsed_regression:${currentElapsedMs}->${nextElapsedMs}`,
    );
  }
  return Object.freeze(issues);
}
