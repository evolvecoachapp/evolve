import type { AdaptationHistory, AdaptationHistoryEntry } from "../models/AdaptationHistory";

export function selectHistoryEntriesByKind(
  history: AdaptationHistory | null,
  kind: string,
): readonly AdaptationHistoryEntry[] {
  if (!history) return Object.freeze([]);
  return Object.freeze(history.entries.filter((e) => e.kind === kind));
}
