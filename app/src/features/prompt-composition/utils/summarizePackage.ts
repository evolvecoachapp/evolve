import type { PromptBlock } from "../models/PromptBlock";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptSection } from "../models/PromptSection";
import type { PromptSummary } from "../models/PromptSummary";
import { formatCountPhrase } from "./formatting";
import { freezePromptSummary } from "./freezePackage";

export function buildPromptSummary(options: {
  readonly packageId: string;
  readonly conversationContextId: string;
  readonly athleteId: string | null;
  readonly blocks: readonly PromptBlock[];
  readonly sections: readonly PromptSection[];
  readonly instructions: readonly PromptInstruction[];
  readonly primaryIntent: string | null;
}): PromptSummary {
  const blockTypes = Object.freeze([
    ...new Set(options.blocks.map((block) => block.type)),
  ]);
  const topBlockIds = Object.freeze(
    options.blocks.slice(0, 5).map((block) => block.id),
  );

  return freezePromptSummary({
    packageId: options.packageId,
    conversationContextId: options.conversationContextId,
    athleteId: options.athleteId,
    blockCount: options.blocks.length,
    sectionCount: options.sections.length,
    instructionCount: options.instructions.length,
    blockTypes,
    topBlockIds,
    primaryIntent: options.primaryIntent,
    summaryText: `${formatCountPhrase(options.blocks.length, "prompt block")} across ${formatCountPhrase(options.sections.length, "section")}.`,
  });
}
