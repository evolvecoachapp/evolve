import type { CoachDecisionReason } from "./CoachDecisionReason";
import type { CoachTimelineEvent } from "./CoachTimelineEvent";

export type CoachTimelineDomain =
  | "workout"
  | "nutrition"
  | "recovery"
  | "goal"
  | "decision"
  | "conversation"
  | "system"
  | "unknown";

/**
 * Immutable Coach Timeline journal entry.
 * Never mutate after append.
 */
export interface CoachTimelineEntry {
  readonly id: string;
  readonly athleteId: string;
  readonly timestamp: string;
  readonly event: CoachTimelineEvent;
  readonly summary: string;
  readonly explanation: string;
  readonly decisionReason: CoachDecisionReason;
  readonly affectedDomain: CoachTimelineDomain;
  readonly relatedPlanVersion: number | null;
  readonly relatedPlanLineageId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly confidence: number;
  readonly metadata: Readonly<Record<string, string>>;
}
