import type { CoachIntent } from "./CoachIntent";
import type { CoachMetadata } from "./CoachMetadata";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

export const CoachExecutionStepStatuses = Object.freeze({
  PENDING: "pending" as const,
  READY: "ready" as const,
  SKIPPED: "skipped" as const,
});

export type CoachExecutionStepStatus =
  (typeof CoachExecutionStepStatuses)[keyof typeof CoachExecutionStepStatuses];

/**
 * One planned specialist invocation within a coaching plan.
 */
export interface CoachExecutionStep {
  readonly id: string;
  readonly agent: SpecialistAgentKind;
  readonly order: number;
  readonly status: CoachExecutionStepStatus;
  readonly reason: string;
}

/**
 * Immutable plan describing which specialist agents to invoke.
 */
export interface CoachExecutionPlan {
  readonly id: string;
  readonly requestId: string;
  readonly intent: CoachIntent;
  readonly steps: readonly CoachExecutionStep[];
  readonly agentKinds: readonly SpecialistAgentKind[];
  readonly metadata: CoachMetadata;
  readonly createdAt: string;
}
