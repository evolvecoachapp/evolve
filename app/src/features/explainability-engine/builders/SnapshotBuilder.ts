import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeSnapshot } from "../utils/FreezeExplanationState";

export function buildExplanationSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly at: string;
}): ExplanationSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanations: input.explanations,
    summary: input.summary,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
