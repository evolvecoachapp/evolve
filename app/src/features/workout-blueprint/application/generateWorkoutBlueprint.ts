import { resolveService } from "../../../core/composition";
import type { WorkoutBlueprintBuilderOptions } from "../builder/WorkoutBlueprintBuilder";
import type { WorkoutBlueprintAIOutput } from "../models/WorkoutBlueprintAIOutput";
import type { WorkoutBlueprintResult } from "../models/WorkoutBlueprintResult";
import type { WorkoutBlueprintService } from "../services";

/**
 * Thin application wrapper — Conversation/Workflow owns the lifecycle.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function generateWorkoutBlueprint(
  aiOutput: WorkoutBlueprintAIOutput | unknown,
  options: WorkoutBlueprintBuilderOptions = {},
  service: WorkoutBlueprintService = resolveService("WorkoutBlueprintService"),
): Promise<WorkoutBlueprintResult> {
  return service.generate(aiOutput, options);
}
