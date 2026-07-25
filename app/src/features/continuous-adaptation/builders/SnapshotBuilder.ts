import type { AdaptationDecision } from "../models/AdaptationDecision";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import { freezeSnapshot } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

export function buildAdaptationSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly at: string;
}): AdaptationSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisions: input.decisions,
    summary: input.summary,
    signalKeys: uniqueSorted(input.decisions.flatMap((d) => d.signalKeys)),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
