import type { PromptBlock } from "../models/PromptBlock";
import type { PromptBlockType } from "../models/PromptBlockType";
import {
  DEFAULT_BUILT_BLOCK_TYPES,
  MANDATORY_PROMPT_BLOCK_TYPES,
} from "../models/PromptBlockType";

/**
 * Select which block types to include for a build.
 */
export function selectBlockTypes(
  requested?: readonly PromptBlockType[],
): readonly PromptBlockType[] {
  if (!requested || requested.length === 0) {
    return DEFAULT_BUILT_BLOCK_TYPES;
  }

  const mandatory = new Set<string>(MANDATORY_PROMPT_BLOCK_TYPES);
  const selected = new Set<string>(requested);
  for (const type of mandatory) {
    selected.add(type);
  }
  return Object.freeze([...selected]) as readonly PromptBlockType[];
}

/**
 * Filter blocks to a selected type set.
 */
export function selectBlocks(
  blocks: readonly PromptBlock[],
  types: readonly PromptBlockType[],
): readonly PromptBlock[] {
  const allowed = new Set<string>(types);
  return Object.freeze(blocks.filter((block) => allowed.has(block.type)));
}
