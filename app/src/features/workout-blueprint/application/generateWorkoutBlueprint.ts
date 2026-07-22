import type { WorkoutBlueprintBuilderOptions } from "../builder/WorkoutBlueprintBuilder";
import type { WorkoutBlueprintAIOutput } from "../models/WorkoutBlueprintAIOutput";
import type { WorkoutBlueprintResult } from "../models/WorkoutBlueprintResult";
import {
  createWorkoutBlueprintService,
  type WorkoutBlueprintService,
} from "../services";

/**
 * Thin application wrapper — Conversation/Workflow owns the lifecycle.
 */
export async function generateWorkoutBlueprint(
  aiOutput: WorkoutBlueprintAIOutput | unknown,
  options: WorkoutBlueprintBuilderOptions = {},
  service: WorkoutBlueprintService = createWorkoutBlueprintService(),
): Promise<WorkoutBlueprintResult> {
  return service.generate(aiOutput, options);
}
