import type { NutritionAgentResult } from "../../nutrition-agent/models/NutritionAgentResult";
import type { RecoveryAgentResult } from "../../recovery-agent/models/RecoveryAgentResult";
import type { WorkoutAgentResult } from "../../workout-agent/models/WorkoutAgentResult";
import type { CoachMetadata } from "./CoachMetadata";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

export const SpecialistInvocationStatuses = Object.freeze({
  SELECTED: "selected" as const,
  INVOKED: "invoked" as const,
  SKIPPED: "skipped" as const,
  FAILED: "failed" as const,
});

export type SpecialistInvocationStatus =
  (typeof SpecialistInvocationStatuses)[keyof typeof SpecialistInvocationStatuses];

/**
 * Record of a specialist agent invocation during coaching.
 */
export interface SpecialistAgentInvocation {
  readonly id: string;
  readonly agent: SpecialistAgentKind;
  readonly status: SpecialistInvocationStatus;
  readonly summary: string;
  readonly success: boolean | null;
  readonly resultId: string | null;
  readonly attributes: Readonly<Record<string, string>>;
  readonly invokedAt: string;
}

export type SpecialistAgentResult =
  | WorkoutAgentResult
  | RecoveryAgentResult
  | NutritionAgentResult;

/**
 * Bundled specialist outputs collected by the coordinator.
 */
export interface SpecialistAgentOutputs {
  readonly workout: WorkoutAgentResult | null;
  readonly recovery: RecoveryAgentResult | null;
  readonly nutrition: NutritionAgentResult | null;
  readonly invocations: readonly SpecialistAgentInvocation[];
  readonly metadata: CoachMetadata;
}
