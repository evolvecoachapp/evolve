import type { CoachDecisionReason } from "./CoachDecisionReason";
import type { CoachTimelineDomain } from "./CoachTimelineEntry";
import type { CoachTimelineEventCategory } from "./CoachTimelineEvent";

/**
 * Request to append a brand-new immutable timeline entry.
 */
export interface AppendTimelineEntryRequest {
  readonly id: string;
  readonly athleteId: string;
  readonly category: CoachTimelineEventCategory;
  readonly summary: string;
  readonly explanation: string;
  readonly decisionReason: CoachDecisionReason;
  readonly affectedDomain: CoachTimelineDomain;
  readonly relatedPlanVersion?: number | null;
  readonly relatedPlanLineageId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly confidence?: number;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
}
