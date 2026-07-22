import { RestSessionBuilder } from "../builders/RestSessionBuilder";
import type { RestSession } from "../models/RestSession";

export const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

/**
 * Create a minimal rest session for tests (90s between sets by default).
 */
export function createMinimalRestSession(
  overrides: {
    readonly id?: string;
    readonly targetDurationMs?: number;
    readonly allowOvertime?: boolean;
    readonly expireOnTarget?: boolean;
    readonly workoutRuntimeId?: string | null;
  } = {},
): RestSession {
  return new RestSessionBuilder().build({
    id: overrides.id ?? "rest-session:test",
    reason: "between_sets",
    targetDurationMs: overrides.targetDurationMs ?? 90_000,
    allowOvertime: overrides.allowOvertime ?? true,
    expireOnTarget: overrides.expireOnTarget ?? false,
    workoutRuntimeId: overrides.workoutRuntimeId ?? null,
    label: "Between sets",
  });
}
