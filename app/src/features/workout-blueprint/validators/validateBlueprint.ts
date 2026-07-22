import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import { WORKOUT_BLUEPRINT_SOURCES } from "../models/WorkoutBlueprintMetadata";
import { SESSION_GOAL_CODES } from "../models/SessionGoal";
import { TRAINING_PRIORITY_CODES } from "../models/TrainingPriority";
import { validateConstraints } from "./validateConstraints";
import { validateTrainingBlock } from "./validateTrainingBlock";
import { validateTrainingFocus } from "./validateTrainingFocus";
import { validateWorkoutSplit } from "./validateWorkoutSplit";

export type BlueprintValidationCode =
  | "missing_id"
  | "invalid_split"
  | "invalid_priority"
  | "invalid_focus"
  | "invalid_constraints"
  | "invalid_blocks"
  | "invalid_days"
  | "invalid_day_id"
  | "invalid_day_index"
  | "invalid_day_name"
  | "invalid_session_goal"
  | "invalid_day_duration"
  | "invalid_weekly_frequency"
  | "missing_metadata_version"
  | "invalid_metadata_source"
  | "missing_metadata_created_at"
  | "invalid_metadata_tags"
  | "frequency_split_mismatch";

/**
 * Validate a WorkoutBlueprint structural contract.
 */
export function validateBlueprint(
  blueprint: unknown,
): readonly BlueprintValidationCode[] {
  const issues: BlueprintValidationCode[] = [];

  if (blueprint === null || typeof blueprint !== "object") {
    return Object.freeze([
      "missing_id",
      "invalid_split",
      "invalid_priority",
      "invalid_focus",
      "invalid_constraints",
      "invalid_blocks",
      "invalid_days",
      "invalid_weekly_frequency",
      "missing_metadata_version",
      "invalid_metadata_source",
      "missing_metadata_created_at",
      "invalid_metadata_tags",
    ]);
  }

  const candidate = blueprint as Partial<WorkoutBlueprint>;

  if (typeof candidate.id !== "string" || candidate.id.trim().length === 0) {
    issues.push("missing_id");
  }

  if (validateWorkoutSplit(candidate.split).length > 0) {
    issues.push("invalid_split");
  }

  if (
    candidate.priority === null ||
    typeof candidate.priority !== "object" ||
    typeof candidate.priority.primary !== "string" ||
    !(TRAINING_PRIORITY_CODES as readonly string[]).includes(
      candidate.priority.primary,
    ) ||
    (candidate.priority.secondary !== null &&
      candidate.priority.secondary !== undefined &&
      (typeof candidate.priority.secondary !== "string" ||
        !(TRAINING_PRIORITY_CODES as readonly string[]).includes(
          candidate.priority.secondary,
        )))
  ) {
    issues.push("invalid_priority");
  }

  if (validateTrainingFocus(candidate.focus).length > 0) {
    issues.push("invalid_focus");
  }

  if (validateConstraints(candidate.constraints).length > 0) {
    issues.push("invalid_constraints");
  }

  if (!Array.isArray(candidate.blocks)) {
    issues.push("invalid_blocks");
  } else {
    for (const block of candidate.blocks) {
      if (validateTrainingBlock(block).length > 0) {
        issues.push("invalid_blocks");
        break;
      }
    }
  }

  if (!Array.isArray(candidate.days)) {
    issues.push("invalid_days");
  } else {
    for (const day of candidate.days) {
      if (day === null || typeof day !== "object") {
        issues.push("invalid_days");
        break;
      }

      if (typeof day.id !== "string" || day.id.trim().length === 0) {
        issues.push("invalid_day_id");
      }

      if (
        typeof day.dayIndex !== "number" ||
        !Number.isInteger(day.dayIndex) ||
        day.dayIndex < 0
      ) {
        issues.push("invalid_day_index");
      }

      if (typeof day.name !== "string" || day.name.trim().length === 0) {
        issues.push("invalid_day_name");
      }

      if (
        typeof day.sessionGoal !== "string" ||
        !(SESSION_GOAL_CODES as readonly string[]).includes(day.sessionGoal)
      ) {
        issues.push("invalid_session_goal");
      }

      if (
        day.estimatedDurationMinutes !== null &&
        day.estimatedDurationMinutes !== undefined &&
        (typeof day.estimatedDurationMinutes !== "number" ||
          !Number.isFinite(day.estimatedDurationMinutes) ||
          day.estimatedDurationMinutes <= 0)
      ) {
        issues.push("invalid_day_duration");
      }

      if (validateTrainingFocus(day.focus).length > 0) {
        issues.push("invalid_focus");
      }
    }
  }

  if (
    typeof candidate.weeklyFrequency !== "number" ||
    !Number.isInteger(candidate.weeklyFrequency) ||
    candidate.weeklyFrequency < 1 ||
    candidate.weeklyFrequency > 7
  ) {
    issues.push("invalid_weekly_frequency");
  } else if (
    candidate.split &&
    typeof candidate.split === "object" &&
    typeof candidate.split.daysPerWeek === "number" &&
    candidate.weeklyFrequency !== candidate.split.daysPerWeek
  ) {
    issues.push("frequency_split_mismatch");
  }

  if (
    typeof candidate.metadata?.version !== "string" ||
    candidate.metadata.version.trim().length === 0
  ) {
    issues.push("missing_metadata_version");
  }

  if (
    typeof candidate.metadata?.source !== "string" ||
    !(WORKOUT_BLUEPRINT_SOURCES as readonly string[]).includes(
      candidate.metadata.source,
    )
  ) {
    issues.push("invalid_metadata_source");
  }

  if (
    typeof candidate.metadata?.createdAt !== "string" ||
    candidate.metadata.createdAt.trim().length === 0
  ) {
    issues.push("missing_metadata_created_at");
  }

  if (!Array.isArray(candidate.metadata?.tags)) {
    issues.push("invalid_metadata_tags");
  }

  return Object.freeze([...new Set(issues)]);
}
