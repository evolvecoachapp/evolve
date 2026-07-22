import { createRestDuration } from "../models/RestDuration";
import type { RestReason } from "../models/RestReason";
import type { RestSession } from "../models/RestSession";
import type { RestTarget } from "../models/RestTarget";

export interface BuildRestSessionInput {
  readonly id?: string;
  readonly reason?: RestReason;
  readonly targetDurationMs: number;
  readonly allowOvertime?: boolean;
  readonly expireOnTarget?: boolean;
  readonly workoutRuntimeId?: string | null;
  readonly exerciseRuntimeId?: string | null;
  readonly setRuntimeId?: string | null;
  readonly label?: string | null;
}

/**
 * Build an immutable RestSession.
 */
export class RestSessionBuilder {
  build(input: BuildRestSessionInput): RestSession {
    const target: RestTarget = Object.freeze({
      duration: createRestDuration(input.targetDurationMs),
      allowOvertime: input.allowOvertime ?? true,
      expireOnTarget: input.expireOnTarget ?? false,
    });

    return Object.freeze({
      id: input.id ?? `rest-session:${input.targetDurationMs}`,
      reason: input.reason ?? "between_sets",
      target,
      workoutRuntimeId: input.workoutRuntimeId ?? null,
      exerciseRuntimeId: input.exerciseRuntimeId ?? null,
      setRuntimeId: input.setRuntimeId ?? null,
      label: input.label ?? null,
    });
  }
}
