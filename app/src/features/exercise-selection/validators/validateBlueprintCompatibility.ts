import type { WorkoutBlueprint } from "../../workout-blueprint/models/WorkoutBlueprint";
import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";

/**
 * Validate that a blueprint is compatible with selection.
 */
export function validateBlueprintCompatibility(
  request: ExerciseSelectionRequest,
): readonly string[] {
  const issues: string[] = [];
  const { blueprint } = request;

  if (!blueprint || typeof blueprint !== "object") {
    return Object.freeze(["blueprint_missing"]);
  }

  if (!blueprint.id || blueprint.id.trim().length === 0) {
    issues.push("blueprint_id_missing");
  }

  if (!Array.isArray(blueprint.days) || blueprint.days.length === 0) {
    issues.push("blueprint_days_empty");
  } else {
    const hasTrainingDay = blueprint.days.some((day) => !day.isRestDay);
    if (!hasTrainingDay) {
      issues.push("blueprint_no_training_day");
    }

    if (request.dayId) {
      const day = blueprint.days.find((entry) => entry.id === request.dayId);
      if (!day) {
        issues.push("blueprint_day_not_found");
      } else if (day.isRestDay) {
        issues.push("blueprint_day_is_rest");
      }
    }
  }

  if (!blueprint.priority?.primary) {
    issues.push("blueprint_priority_missing");
  }

  return Object.freeze(issues);
}

export function assertBlueprintShape(
  blueprint: WorkoutBlueprint,
): readonly string[] {
  return validateBlueprintCompatibility({ blueprint });
}
