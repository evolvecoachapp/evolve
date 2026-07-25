import type { GoalHistory, GoalHistoryEntry } from "../models/GoalHistory";

export function selectHistoryEntriesByKind(
  history: GoalHistory | null,
  kind: string,
): readonly GoalHistoryEntry[] {
  if (!history) return Object.freeze([]);
  return Object.freeze(history.entries.filter((e) => e.kind === kind));
}
