import { WorkoutBlueprintError } from "../models/WorkoutBlueprintError";
import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type { WorkoutBlueprintAIOutput } from "../models/WorkoutBlueprintAIOutput";
import type { WorkoutBlueprintSource } from "../models/WorkoutBlueprintMetadata";
import { normalizeBlueprint } from "../utils/normalizeBlueprint";
import { freezeBlueprint } from "../utils/freezeBlueprint";
import { validateBlueprint } from "../validators/validateBlueprint";

export interface WorkoutBlueprintBuilderOptions {
  readonly id?: string;
  readonly createdAt?: string;
  readonly athleteId?: string | null;
  readonly source?: WorkoutBlueprintSource;
}

/**
 * Validates AI strategic output, normalizes, and freezes a WorkoutBlueprint.
 *
 * Never generates exercises, sets, reps, RPE, or progression.
 */
export class WorkoutBlueprintBuilder {
  /**
   * Build an immutable blueprint from AI strategic decisions.
   *
   * @throws WorkoutBlueprintError when validation fails after normalization.
   */
  build(
    aiOutput: WorkoutBlueprintAIOutput | unknown,
    options: WorkoutBlueprintBuilderOptions = {},
  ): WorkoutBlueprint {
    const normalized = normalizeBlueprint(aiOutput, {
      id: options.id,
      createdAt: options.createdAt,
      athleteId: options.athleteId,
      source: options.source ?? "ai",
    });

    const issues = validateBlueprint(normalized);
    if (issues.length > 0) {
      throw new WorkoutBlueprintError(
        "invalid_ai_output",
        `Invalid workout blueprint AI output: ${issues.join(",")}`,
        { issues },
      );
    }

    return freezeBlueprint(normalized);
  }
}
