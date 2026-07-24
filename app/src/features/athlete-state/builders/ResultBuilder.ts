import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type {
  AthleteStateOperationKind,
  AthleteStateResult,
} from "../models/AthleteStateResult";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type { StateDiagnostics } from "../models/StateDiagnostics";
import type { StateError } from "../models/StateError";
import type { StateSummary } from "../models/StateSummary";
import {
  EMPTY_STATE_VALIDATION,
  type StateValidation,
} from "../models/StateValidation";
import { freezeResult } from "../utils/FreezeAthleteState";

export function buildAthleteStateResult(input: {
  readonly id: string;
  readonly operation: AthleteStateOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly athleteId?: string | null;
  readonly state?: AthleteState | null;
  readonly snapshot?: AthleteSnapshot | null;
  readonly summary?: StateSummary | null;
  readonly supervisorContext?: CoachSupervisorContext | null;
  readonly descriptor?: AthleteStateDescriptor | null;
  readonly validation?: StateValidation;
  readonly diagnostics?: StateDiagnostics;
  readonly error?: StateError | null;
  readonly startedAt: string;
  readonly completedAt: string;
}): AthleteStateResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    message: input.message,
    athleteId: input.athleteId ?? input.state?.athleteId ?? null,
    state: input.state ?? null,
    snapshot: input.snapshot ?? null,
    summary: input.summary ?? null,
    supervisorContext: input.supervisorContext ?? null,
    descriptor: input.descriptor ?? null,
    validation: input.validation ?? EMPTY_STATE_VALIDATION,
    diagnostics: input.diagnostics ??
      Object.freeze({
        warnings: Object.freeze([] as string[]),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_ATHLETE_METADATA,
      }),
    error: input.error ?? null,
    metadata: EMPTY_ATHLETE_METADATA,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    frozenAt: input.completedAt,
  });
}
