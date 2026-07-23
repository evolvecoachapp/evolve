import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutConfidence } from "./WorkoutConfidence";
import type { WorkoutIntent } from "./WorkoutIntent";
import type { WorkoutObjective } from "./WorkoutObjective";
import type { WorkoutPlanProposal } from "./WorkoutPlanProposal";

/**
 * Agent decision after reasoning + planning + policy checks.
 */
export interface WorkoutDecision {
  readonly id: string;
  readonly intent: WorkoutIntent;
  readonly objective: WorkoutObjective;
  readonly strategyId: string | null;
  readonly proposal: WorkoutPlanProposal | null;
  readonly accepted: boolean;
  readonly confidence: WorkoutConfidence;
  readonly reasons: readonly string[];
  readonly policyFlags: readonly string[];
  readonly metadata: WorkoutAgentMetadata;
  readonly decidedAt: string;
}
