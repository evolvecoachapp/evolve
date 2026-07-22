import type { TrainingBlock } from "../models/TrainingBlock";
import { TRAINING_PRIORITY_CODES } from "../models/TrainingPriority";
import { validateTrainingFocus } from "./validateTrainingFocus";

export type TrainingBlockValidationCode =
  | "missing_block_id"
  | "missing_block_name"
  | "invalid_block_order"
  | "invalid_block_week_count"
  | "invalid_block_priority"
  | "invalid_block_focus";

/**
 * Validate a TrainingBlock structural contract.
 */
export function validateTrainingBlock(
  block: unknown,
): readonly TrainingBlockValidationCode[] {
  const issues: TrainingBlockValidationCode[] = [];

  if (block === null || typeof block !== "object") {
    return Object.freeze([
      "missing_block_id",
      "missing_block_name",
      "invalid_block_order",
      "invalid_block_week_count",
      "invalid_block_priority",
      "invalid_block_focus",
    ]);
  }

  const candidate = block as Partial<TrainingBlock>;

  if (typeof candidate.id !== "string" || candidate.id.trim().length === 0) {
    issues.push("missing_block_id");
  }

  if (typeof candidate.name !== "string" || candidate.name.trim().length === 0) {
    issues.push("missing_block_name");
  }

  if (
    typeof candidate.order !== "number" ||
    !Number.isInteger(candidate.order) ||
    candidate.order < 0
  ) {
    issues.push("invalid_block_order");
  }

  if (
    typeof candidate.weekCount !== "number" ||
    !Number.isInteger(candidate.weekCount) ||
    candidate.weekCount < 1
  ) {
    issues.push("invalid_block_week_count");
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
    issues.push("invalid_block_priority");
  }

  if (validateTrainingFocus(candidate.focus).length > 0) {
    issues.push("invalid_block_focus");
  }

  return Object.freeze([...new Set(issues)]);
}
