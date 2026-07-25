import type { AdaptationDecision } from "../models/AdaptationDecision";

export function selectHighestPriorityDecisions(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationDecision[] {
  if (decisions.length === 0) return Object.freeze([]);
  const min = Math.min(...decisions.map((d) => d.priority.ordinal));
  return Object.freeze(decisions.filter((d) => d.priority.ordinal === min));
}
