import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import type { GoalProgress } from "../models/GoalProgress";
import type { GoalHistory, GoalHistoryEntry } from "../models/GoalHistory";
import { freezeHistory, freezeHistoryEntry } from "../utils/FreezeGoalProgress";

export function buildGoalHistory(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly decisions: readonly GoalProgress[];
  readonly historyKeys: readonly string[];
  readonly at: string;
}): GoalHistory {
  const fromDecisions: GoalHistoryEntry[] = input.decisions.map((d) =>
    freezeHistoryEntry({
      id: `hist:${d.id}`,
      subjectId: d.id,
      kind: "decision",
      at: d.createdAt,
      signalKeys: d.signalKeys,
      metadata: EMPTY_GOAL_METADATA,
    }),
  );
  const fromKeys: GoalHistoryEntry[] = input.historyKeys.map((k, i) =>
    freezeHistoryEntry({
      id: `hist:key:${i}:${k}`,
      subjectId: k,
      kind: "history_key",
      at: input.at,
      signalKeys: Object.freeze([k]),
      metadata: EMPTY_GOAL_METADATA,
    }),
  );
  return freezeHistory({
    id: input.id,
    athleteId: input.athleteId,
    entries: Object.freeze([...fromDecisions, ...fromKeys]),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: input.at,
  });
}
