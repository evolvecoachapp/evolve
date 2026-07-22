import type { PromptBlock } from "../models/PromptBlock";
import type { PromptInstruction } from "../models/PromptInstruction";
import {
  PROMPT_PRIORITY_DEFAULT,
  PROMPT_PRIORITY_MAX,
  PROMPT_PRIORITY_MIN,
} from "../models/PromptPriority";

/**
 * Clamp a priority into the valid 1–100 range.
 */
export function normalizePriority(priority: number): number {
  if (!Number.isFinite(priority)) {
    return PROMPT_PRIORITY_DEFAULT;
  }
  return Math.min(
    PROMPT_PRIORITY_MAX,
    Math.max(PROMPT_PRIORITY_MIN, Math.round(priority)),
  );
}

export function normalizeBlockPriorities(
  blocks: readonly PromptBlock[],
): readonly PromptBlock[] {
  return blocks.map((block) => {
    const priority = normalizePriority(block.priority);
    if (priority === block.priority) {
      return block;
    }
    return Object.freeze({ ...block, priority });
  });
}

export function normalizeInstructionPriorities(
  instructions: readonly PromptInstruction[],
): readonly PromptInstruction[] {
  return instructions.map((instruction) => {
    const priority = normalizePriority(instruction.priority);
    if (priority === instruction.priority) {
      return instruction;
    }
    return Object.freeze({ ...instruction, priority });
  });
}
