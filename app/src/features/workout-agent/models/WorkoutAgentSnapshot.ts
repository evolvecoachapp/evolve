import type { WorkoutAgentStatistics } from "./WorkoutAgentStatistics";
import type { WorkoutDecision } from "./WorkoutDecision";
import type { WorkoutExplanation } from "./WorkoutExplanation";
import type { WorkoutPlanProposal } from "./WorkoutPlanProposal";

/**
 * Frozen snapshot of agent outputs for a single run.
 */
export interface WorkoutAgentSnapshot {
  readonly id: string;
  readonly decision: WorkoutDecision | null;
  readonly proposal: WorkoutPlanProposal | null;
  readonly explanation: WorkoutExplanation | null;
  readonly statistics: WorkoutAgentStatistics;
  readonly frozenAt: string;
}
