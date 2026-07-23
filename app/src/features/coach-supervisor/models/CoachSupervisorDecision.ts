import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { SupervisorConfidence } from "./SupervisorConfidence";
import type { SupervisorReasoning } from "./SupervisorReasoning";

export const CoachSupervisorDecisionKinds = {
  COORDINATE: "coordinate",
  SKIP: "skip",
  FAIL: "fail",
} as const;

export type CoachSupervisorDecisionKind =
  (typeof CoachSupervisorDecisionKinds)[keyof typeof CoachSupervisorDecisionKinds];

/**
 * Immutable orchestration decision (structural only).
 */
export interface CoachSupervisorDecision {
  readonly id: string;
  readonly kind: CoachSupervisorDecisionKind;
  readonly selectedAgentIds: readonly string[];
  readonly selectedCapabilityIds: readonly string[];
  readonly confidence: SupervisorConfidence;
  readonly reasoning: SupervisorReasoning;
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
}
