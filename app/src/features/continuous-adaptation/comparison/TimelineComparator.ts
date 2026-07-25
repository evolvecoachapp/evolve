import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareTimelines(
  before: AdaptationTimeline | null,
  after: AdaptationTimeline | null,
): KeyDiff {
  const beforeIds = before ? before.items.map((i) => i.id) : [];
  const afterIds = after ? after.items.map((i) => i.id) : [];
  return diffKeys(beforeIds, afterIds);
}
