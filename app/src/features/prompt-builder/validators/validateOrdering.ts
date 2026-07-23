import type { PromptPackage } from "../models/PromptPackage";

/**
 * Validate block ordering is non-decreasing by order field.
 */
export function validateOrdering(
  promptPackage: PromptPackage,
): readonly string[] {
  const issues: string[] = [];
  const blocks = promptPackage.blocks;

  for (let i = 1; i < blocks.length; i += 1) {
    const prev = blocks[i - 1];
    const curr = blocks[i];
    if (prev.order > curr.order) {
      issues.push(`block_order_regression:${prev.id}->${curr.id}`);
    }
  }

  for (const block of blocks) {
    if (block.order < 1) {
      issues.push(`block_invalid_order:${block.id}`);
    }
  }

  return issues;
}
