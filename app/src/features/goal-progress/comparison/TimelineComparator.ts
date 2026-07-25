import type { GoalTimeline } from "../models/GoalTimeline";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareTimelines(
  before: GoalTimeline | null,
  after: GoalTimeline | null,
): KeyDiff {
  const beforeIds = before ? before.items.map((i) => i.id) : [];
  const afterIds = after ? after.items.map((i) => i.id) : [];
  return diffKeys(beforeIds, afterIds);
}
