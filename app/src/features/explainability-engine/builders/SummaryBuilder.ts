import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { collectReasonCodes } from "../utils/ExplanationHelpers";
import { freezeSummary } from "../utils/FreezeExplanationState";

export function buildExplanationSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly focusAreaKeys: readonly string[];
  readonly at: string;
}): ExplanationSummary {
  const reasonCodes = collectReasonCodes(input.explanations);
  let evidenceCount = 0;
  for (const e of input.explanations) evidenceCount += e.evidence.length;
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanationCount: input.explanations.length,
    reasonCodeKeys: reasonCodes,
    evidenceKeyCount: evidenceCount,
    focusAreaKeys: Object.freeze([...input.focusAreaKeys]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
