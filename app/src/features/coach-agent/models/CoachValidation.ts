import type { CoachMetadata } from "./CoachMetadata";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

export const CoachValidationCodes = Object.freeze({
  MISSING_FIELD: "missing_field" as const,
  INVALID_VALUE: "invalid_value" as const,
  INCOMPATIBLE: "incompatible" as const,
  EMPTY_PLAN: "empty_plan" as const,
  UNSUPPORTED_AGENT: "unsupported_agent" as const,
  MERGE_INVALID: "merge_invalid" as const,
  LIFECYCLE_INVALID: "lifecycle_invalid" as const,
});

export type CoachValidationCode =
  (typeof CoachValidationCodes)[keyof typeof CoachValidationCodes];

export interface CoachValidationIssue {
  readonly code: CoachValidationCode;
  readonly message: string;
  readonly path: string;
}

/**
 * Immutable validation report for coach orchestration integrity.
 */
export interface CoachValidation {
  readonly valid: boolean;
  readonly issues: readonly CoachValidationIssue[];
}

export interface CoachEvaluation {
  readonly id: string;
  readonly requestId: string | null;
  readonly planId: string | null;
  readonly decisionId: string | null;
  readonly validation: CoachValidation;
  readonly findings: readonly string[];
  readonly score: number | null;
  readonly agentsEvaluated: readonly SpecialistAgentKind[];
  readonly metadata: CoachMetadata;
  readonly evaluatedAt: string;
}
