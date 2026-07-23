import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";

export const CoordinationStepKinds = {
  ROUTE: "route",
  SELECT_AGENT: "select_agent",
  INVOKE_AGENT: "invoke_agent",
  AGGREGATE: "aggregate",
  RESPOND: "respond",
} as const;

export type CoordinationStepKind =
  (typeof CoordinationStepKinds)[keyof typeof CoordinationStepKinds];

/**
 * Immutable coordination step.
 */
export interface CoordinationStep {
  readonly id: string;
  readonly kind: CoordinationStepKind;
  readonly agentId: string | null;
  readonly capabilityId: string | null;
  readonly orderIndex: number;
  readonly dependsOnStepIds: readonly string[];
  readonly phaseId: string | null;
  readonly description: string | null;
  readonly metadata: CoachSupervisorMetadata;
}
