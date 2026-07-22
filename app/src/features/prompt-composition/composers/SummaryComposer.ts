import type { PromptBlock } from "../models/PromptBlock";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptSection } from "../models/PromptSection";
import type { PromptSummary } from "../models/PromptSummary";
import { buildPromptSummary } from "../utils/summarizePackage";

export interface SummaryCompositionInput {
  readonly packageId: string;
  readonly conversationContextId: string;
  readonly athleteId: string | null;
  readonly blocks: readonly PromptBlock[];
  readonly sections: readonly PromptSection[];
  readonly instructions: readonly PromptInstruction[];
  readonly primaryIntent: string | null;
}

/**
 * Composes a PromptSummary from package facts.
 * One responsibility: summary composition only.
 */
export class SummaryComposer {
  compose(input: SummaryCompositionInput): PromptSummary {
    return buildPromptSummary(input);
  }
}

export function createSummaryComposer(): SummaryComposer {
  return new SummaryComposer();
}
