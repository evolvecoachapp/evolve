import type { AggregationResult } from "./AggregationResult";
import type { CoachSupervisorContext } from "./CoachSupervisorContext";
import type { CoachSupervisorError } from "./CoachSupervisorError";
import type { CoachSupervisorEvent } from "./CoachSupervisorEvent";
import type { CoachSupervisorExecution } from "./CoachSupervisorExecution";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "./CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "./CoachSupervisorRequest";
import type { CoachSupervisorSnapshot } from "./CoachSupervisorSnapshot";
import type { CoachSupervisorSummary } from "./CoachSupervisorSummary";
import type { CoachSupervisorValidation } from "./CoachSupervisorValidation";
import type { UnifiedCoachResponse } from "./UnifiedCoachResponse";

export const CoachSupervisorOperationKinds = {
  PROCESS: "process",
  BUILD_PLAN: "build_plan",
  AGGREGATE: "aggregate",
  DESCRIBE: "describe",
  VALIDATE: "validate",
} as const;

export type CoachSupervisorOperationKind =
  (typeof CoachSupervisorOperationKinds)[keyof typeof CoachSupervisorOperationKinds];

/**
 * Immutable primary output of Coach Supervisor operations.
 */
export interface CoachSupervisorResult {
  readonly id: string;
  readonly operation: CoachSupervisorOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly request: CoachSupervisorRequest | null;
  readonly context: CoachSupervisorContext | null;
  readonly plan: CoachSupervisorPlan | null;
  readonly execution: CoachSupervisorExecution | null;
  readonly aggregation: AggregationResult | null;
  readonly response: UnifiedCoachResponse | null;
  readonly summary: CoachSupervisorSummary | null;
  readonly snapshot: CoachSupervisorSnapshot | null;
  readonly validation: CoachSupervisorValidation;
  readonly error: CoachSupervisorError | null;
  readonly events: readonly CoachSupervisorEvent[];
  readonly metadata: CoachSupervisorMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
