import type { WorkoutGenerationResult } from "../../program-generation/models/WorkoutGenerationResult";
import type { WorkoutAgentResult } from "./WorkoutAgentResult";
import type { WorkoutPlanProposal } from "./WorkoutPlanProposal";

/**
 * Immutable Workout Agent generation output.
 * Agent owns workout intelligence; Program Generation supplies the assembled session.
 */
export interface WorkoutAgentGenerateResult {
  readonly agent: WorkoutAgentResult;
  readonly proposal: WorkoutPlanProposal;
  readonly generation: WorkoutGenerationResult;
  readonly success: boolean;
  readonly message: string | null;
}
