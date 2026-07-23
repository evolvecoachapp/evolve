import type { PromptPackage } from "../models/PromptPackage";
import { MANDATORY_PROMPT_BLOCK_TYPES } from "../models/PromptBlockType";

/**
 * Validate missing mandatory blocks.
 */
export function validateMissingBlocks(
  promptPackage: PromptPackage,
): readonly string[] {
  const present = new Set(promptPackage.blocks.map((b) => b.type));
  const issues: string[] = [];
  for (const type of MANDATORY_PROMPT_BLOCK_TYPES) {
    if (!present.has(type)) {
      issues.push(`missing_mandatory_block:${type}`);
    }
  }
  return issues;
}
