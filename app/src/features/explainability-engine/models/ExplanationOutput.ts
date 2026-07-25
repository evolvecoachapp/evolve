import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationPackage } from "./ExplanationPackage";
import type { LLMFormatterInput } from "./LLMFormatterInput";

/**
 * Compact structured output handoff.
 */
export interface ExplanationOutput {
  readonly explanations: readonly CoachingExplanation[];
  readonly package: ExplanationPackage | null;
  readonly llmFormatterInput: LLMFormatterInput | null;
}
