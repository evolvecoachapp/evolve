import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutObjective } from "./WorkoutObjective";
import type { WorkoutReasoning } from "./WorkoutReasoning";

/**
 * Planning context — domain knowledge organized before plan proposal.
 */
export interface WorkoutPlanningContext {
  readonly id: string;
  readonly contextId: string;
  readonly objective: WorkoutObjective;
  readonly strategyId: string | null;
  readonly reasoning: readonly WorkoutReasoning[];
  readonly volumeTarget: number | null;
  readonly intensityTarget: number | null;
  readonly frequencyTarget: number | null;
  readonly splitHint: string | null;
  readonly recoveryFlag: boolean;
  readonly metadata: WorkoutAgentMetadata;
  readonly frozenAt: string;
}
