import type { WorkoutAgentMetadata } from "./WorkoutAgentMetadata";
import type { WorkoutConfidence } from "./WorkoutConfidence";
import type { WorkoutObjective } from "./WorkoutObjective";

/**
 * Immutable workout plan proposal (planning only — no execution).
 */
export interface WorkoutPlanProposal {
  readonly id: string;
  readonly planningContextId: string;
  readonly objective: WorkoutObjective;
  readonly strategyId: string | null;
  readonly split: string;
  readonly daysPerWeek: number;
  readonly primaryLifts: readonly string[];
  readonly accessories: readonly string[];
  readonly volumeScore: number;
  readonly intensityScore: number;
  readonly progressionCue: string | null;
  readonly deloadRecommended: boolean;
  readonly recoveryNotes: readonly string[];
  readonly confidence: WorkoutConfidence;
  readonly rationale: readonly string[];
  readonly metadata: WorkoutAgentMetadata;
  readonly createdAt: string;
}
