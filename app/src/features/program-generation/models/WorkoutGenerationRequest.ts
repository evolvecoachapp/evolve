import type { AthleteContextSnapshot } from "../../athlete-context/models/AthleteContextSnapshot";
import type { ConversationContext } from "../../ai/models/ConversationContext";
import type { EquipmentCode } from "../../exercise-kb/models/EquipmentRequirement";
import type { ExerciseDifficultyLevel } from "../../exercise-kb/models/ExerciseDifficulty";
import type { ProgressionWindow } from "../../progression/models/ProgressionWindow";
import type { WorkflowContext } from "../../workflow/models/WorkflowContext";
import type { WorkoutBlueprintAIOutput } from "../../workout-blueprint/models/WorkoutBlueprintAIOutput";

/**
 * Sprint-facing alias for the athlete context snapshot consumed by generation.
 */
export type AthleteContext = AthleteContextSnapshot;

/**
 * Input to the Program Generation Orchestrator.
 *
 * Coordinates existing engines — does not contain AI prompts or engine logic.
 * `blueprintSource` is pre-supplied strategic output; the orchestrator never
 * invokes an LLM.
 */
export interface WorkoutGenerationRequest {
  readonly athleteContext: AthleteContext;
  readonly conversationContext?: ConversationContext;
  readonly workflowContext?: WorkflowContext;
  /**
   * Strategic blueprint source for WorkoutBlueprintService.generate.
   * Must be supplied by the caller (workflow/AI layer) — no AI here.
   */
  readonly blueprintSource: WorkoutBlueprintAIOutput | unknown;
  readonly dayId?: string;
  readonly weekNumber?: number;
  readonly availableEquipment?: readonly EquipmentCode[];
  readonly maxDifficulty?: ExerciseDifficultyLevel;
  readonly excludedExerciseIds?: readonly string[];
  readonly progressionWindow?: ProgressionWindow;
  readonly includeExplanations?: boolean;
}
