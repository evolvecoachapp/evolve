import type { CoachMetadata } from "./CoachMetadata";
import type { CoachExecutionStatus } from "./CoachExecutionState";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

export const CoachExecutionEventTypes = Object.freeze({
  STATE_CHANGED: "state_changed" as const,
  AGENT_SELECTED: "agent_selected" as const,
  AGENT_INVOKED: "agent_invoked" as const,
  AGENT_COMPLETED: "agent_completed" as const,
  AGENT_FAILED: "agent_failed" as const,
  MERGE_STARTED: "merge_started" as const,
  MERGE_COMPLETED: "merge_completed" as const,
  PLAN_BUILT: "plan_built" as const,
});

export type CoachExecutionEventType =
  (typeof CoachExecutionEventTypes)[keyof typeof CoachExecutionEventTypes];

/**
 * Immutable lifecycle event emitted during Coach orchestration.
 */
export interface CoachExecutionEvent {
  readonly id: string;
  readonly type: CoachExecutionEventType;
  readonly requestId: string | null;
  readonly planId: string | null;
  readonly status: CoachExecutionStatus | null;
  readonly agent: SpecialistAgentKind | null;
  readonly message: string | null;
  readonly metadata: CoachMetadata;
  readonly occurredAt: string;
}
