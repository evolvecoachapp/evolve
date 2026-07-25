import type { AdaptationDecision } from "../models/AdaptationDecision";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import { freezeSummary } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildAdaptationSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): AdaptationSummary {
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionCount: input.decisions.length,
    opportunityCount: input.decisions.reduce((n, d) => n + d.opportunities.length, 0),
    triggerCount: input.decisions.reduce((n, d) => n + d.triggers.length, 0),
    categoryKeys: uniqueSorted(input.decisions.map((d) => d.category)),
    signalKeys: uniqueSorted(input.decisions.flatMap((d) => d.signalKeys)),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
