import type { PromptBlock } from "../models/PromptBlock";
import { DEFAULT_BLOCK_ORDER } from "../models/PromptBlockType";
import type { PromptInstruction } from "../models/PromptInstruction";

/**
 * Sort blocks by order, then priority (desc), then id.
 */
export function sortBlocks(
  blocks: readonly PromptBlock[],
): readonly PromptBlock[] {
  return Object.freeze(
    [...blocks].sort((a, b) => {
      const orderA = a.order ?? DEFAULT_BLOCK_ORDER[a.type] ?? 999;
      const orderB = b.order ?? DEFAULT_BLOCK_ORDER[b.type] ?? 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}

/**
 * Sort instructions by priority (desc), then id.
 */
export function sortInstructions(
  instructions: readonly PromptInstruction[],
): readonly PromptInstruction[] {
  return Object.freeze(
    [...instructions].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}
