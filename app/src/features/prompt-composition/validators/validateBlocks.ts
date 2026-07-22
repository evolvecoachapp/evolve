import type { PromptBlock } from "../models/PromptBlock";
import {
  DEFAULT_BLOCK_ORDER,
  MANDATORY_PROMPT_BLOCK_TYPES,
} from "../models/PromptBlockType";
import { isValidPromptPriority } from "../models/PromptPriority";

/**
 * Validate block consistency (type/section alignment, required fields).
 */
export function validateBlockConsistency(
  blocks: readonly PromptBlock[],
): readonly string[] {
  const issues: string[] = [];

  for (const block of blocks) {
    if (!block.id) {
      issues.push("block_missing_id");
    }
    if (!block.title) {
      issues.push(`block_missing_title:${block.id || "unknown"}`);
    }
    if (!block.statement) {
      issues.push(`block_missing_statement:${block.id || "unknown"}`);
    }
    if (!block.type) {
      issues.push(`block_missing_type:${block.id || "unknown"}`);
    }
    if (!block.section) {
      issues.push(`block_missing_section:${block.id || "unknown"}`);
    }
  }

  return issues;
}

/**
 * Detect duplicate block ids or duplicate composed types.
 */
export function validateDuplicateBlocks(
  blocks: readonly PromptBlock[],
): readonly string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  const types = new Set<string>();

  for (const block of blocks) {
    if (ids.has(block.id)) {
      issues.push(`duplicate_block_id:${block.id}`);
    } else {
      ids.add(block.id);
    }

    if (types.has(block.type)) {
      issues.push(`duplicate_block_type:${block.type}`);
    } else {
      types.add(block.type);
    }
  }

  return issues;
}

/**
 * Ensure mandatory block types are present.
 */
export function validateMissingMandatoryBlocks(
  blocks: readonly PromptBlock[],
): readonly string[] {
  const present = new Set(blocks.map((block) => block.type));
  const issues: string[] = [];

  for (const type of MANDATORY_PROMPT_BLOCK_TYPES) {
    if (!present.has(type)) {
      issues.push(`missing_mandatory_block:${type}`);
    }
  }

  return issues;
}

/**
 * Validate block ordering against default composition order.
 */
export function validateBlockOrdering(
  blocks: readonly PromptBlock[],
): readonly string[] {
  const issues: string[] = [];

  for (let i = 1; i < blocks.length; i += 1) {
    const prev = blocks[i - 1];
    const curr = blocks[i];
    if (prev.order > curr.order) {
      issues.push(`block_order_regression:${prev.id}->${curr.id}`);
    }
  }

  for (const block of blocks) {
    const expected = DEFAULT_BLOCK_ORDER[block.type];
    if (expected !== undefined && block.order < 1) {
      issues.push(`block_invalid_order:${block.id}`);
    }
  }

  return issues;
}

/**
 * Validate block priorities are in range.
 */
export function validateBlockPriorities(
  blocks: readonly PromptBlock[],
): readonly string[] {
  const issues: string[] = [];

  for (const block of blocks) {
    if (!isValidPromptPriority(block.priority)) {
      issues.push(`invalid_block_priority:${block.id}`);
    }
  }

  return issues;
}
