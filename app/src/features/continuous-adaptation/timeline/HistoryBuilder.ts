import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationHistory, AdaptationHistoryEntry } from "../models/AdaptationHistory";
import { freezeHistory, freezeHistoryEntry } from "../utils/FreezeAdaptationState";

export function buildAdaptationHistory(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly historyKeys: readonly string[];
  readonly at: string;
}): AdaptationHistory {
  const fromDecisions: AdaptationHistoryEntry[] = input.decisions.map((d) =>
    freezeHistoryEntry({
      id: `hist:${d.id}`,
      subjectId: d.id,
      kind: "decision",
      at: d.createdAt,
      signalKeys: d.signalKeys,
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  const fromKeys: AdaptationHistoryEntry[] = input.historyKeys.map((k, i) =>
    freezeHistoryEntry({
      id: `hist:key:${i}:${k}`,
      subjectId: k,
      kind: "history_key",
      at: input.at,
      signalKeys: Object.freeze([k]),
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  return freezeHistory({
    id: input.id,
    athleteId: input.athleteId,
    entries: Object.freeze([...fromDecisions, ...fromKeys]),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
