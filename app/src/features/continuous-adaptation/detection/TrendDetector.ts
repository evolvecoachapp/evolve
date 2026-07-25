import { AdaptationCategories } from "../models/AdaptationCategory";
import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import { AdaptationTriggerKinds, type AdaptationTrigger } from "../models/AdaptationTrigger";
import type { AdaptationInput } from "../models/AdaptationInput";
import { priorityForOrdinal } from "../models/AdaptationPriority";
import { severityForSignalCount } from "../models/AdaptationSeverity";
import { freezeCandidate, freezeOpportunity, freezeTrigger } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

const PREFIXES = Object.freeze(["trend"] as string[]);

function matchingKeys(input: AdaptationInput): readonly string[] {
  const all = uniqueSorted([
    ...input.stateKeys,
    ...input.performanceKeys,
    ...input.recoveryKeys,
    ...input.nutritionKeys,
    ...input.goalKeys,
    ...input.adherenceKeys,
    ...input.historyKeys,
    ...input.timelineKeys,
    ...Object.entries(input.signalFlags).filter(([, v]) => v).map(([k]) => k),
  ]);
  return uniqueSorted(all.filter((k) => PREFIXES.some((p) => k.includes(p))));
}

/** Detect signal key/flag presence only — no prediction. */
export function detectTrend(input: AdaptationInput): {
  readonly triggers: readonly AdaptationTrigger[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
} {
  const keys = matchingKeys(input);
  const triggers = Object.freeze(
    keys.map((signalKey, i) =>
      freezeTrigger({
        id: `trigger:trend:${i}:${input.id}`,
        kind: AdaptationTriggerKinds.TREND,
        signalKey,
        subjectId: input.athleteId,
        present: true,
        metadata: EMPTY_ADAPTATION_METADATA,
      }),
    ),
  );
  const candidates = Object.freeze(
    keys.length === 0
      ? []
      : [
          freezeCandidate({
            id: `candidate:trend:${input.id}`,
            category: AdaptationCategories.GENERAL,
            subjectId: input.athleteId,
            triggerIds: Object.freeze(triggers.map((t) => t.id)),
            signalKeys: keys,
            priority: priorityForOrdinal(Math.min(3, Math.max(0, keys.length - 1))),
            metadata: EMPTY_ADAPTATION_METADATA,
          }),
        ],
  );
  const opportunities = Object.freeze(
    keys.length === 0
      ? []
      : [
          freezeOpportunity({
            id: `opportunity:trend:${input.id}`,
            category: AdaptationCategories.GENERAL,
            subjectId: input.athleteId,
            candidateIds: Object.freeze(candidates.map((c) => c.id)),
            signalKeys: keys,
            severity: severityForSignalCount(keys.length),
            metadata: EMPTY_ADAPTATION_METADATA,
          }),
        ],
  );
  return Object.freeze({ triggers, candidates, opportunities });
}

export const TrendDetector = { detect: detectTrend };
