import type { CoachIntent } from "./CoachIntent";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

/**
 * Compact immutable summary of a coaching run.
 */
export interface CoachSummary {
  readonly requestId: string;
  readonly intent: CoachIntent;
  readonly agentsInvoked: readonly SpecialistAgentKind[];
  readonly recommendationCount: number;
  readonly conflictCount: number;
  readonly accepted: boolean;
  readonly success: boolean;
  readonly message: string;
  readonly createdAt: string;
}
