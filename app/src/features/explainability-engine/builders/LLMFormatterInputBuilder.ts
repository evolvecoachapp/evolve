import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { collectEvidenceKeys, collectReasonCodes, explanationIds } from "../utils/ExplanationHelpers";
import { freezeLLMFormatterInput } from "../utils/FreezeExplanationState";

export function buildLLMFormatterInput(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly at: string;
}): LLMFormatterInput {
  const sectionKeys = Object.freeze(input.explanations.flatMap((e) => e.sections.map((s) => s.key)));
  return freezeLLMFormatterInput({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanationIds: explanationIds(input.explanations),
    sectionKeys,
    reasonCodes: collectReasonCodes(input.explanations),
    evidenceKeys: collectEvidenceKeys(input.explanations),
    summary: input.summary,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
