import type { PromptBlock } from "../models/PromptBlock";
import type { PromptConstraint } from "../models/PromptConstraint";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptSection } from "../models/PromptSection";
import type { PromptStatistics } from "../models/PromptStatistics";
import { freezeStatistics } from "./freezePackage";

/**
 * Build PromptStatistics from package parts.
 */
export function buildStatistics(input: {
  readonly blocks: readonly PromptBlock[];
  readonly sections: readonly PromptSection[];
  readonly instructions: readonly PromptInstruction[];
  readonly constraints: readonly PromptConstraint[];
}): PromptStatistics {
  const blockTypeCounts: Record<string, number> = {};
  let characterCount = 0;

  for (const block of input.blocks) {
    blockTypeCounts[block.type] = (blockTypeCounts[block.type] ?? 0) + 1;
    characterCount += block.statement.length + block.title.length;
  }

  for (const instruction of input.instructions) {
    characterCount += instruction.statement.length;
  }

  for (const constraint of input.constraints) {
    characterCount += constraint.statement.length;
  }

  return freezeStatistics({
    blockCount: input.blocks.length,
    sectionCount: input.sections.length,
    instructionCount: input.instructions.length,
    constraintCount: input.constraints.length,
    characterCount,
    approxTokenCount: Math.ceil(characterCount / 4),
    blockTypeCounts: Object.freeze(blockTypeCounts),
  });
}
