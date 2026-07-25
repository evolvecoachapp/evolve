import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareDecisionIds(
  before: readonly CoachingDecision[],
  after: readonly CoachingDecision[],
): KeyDiff {
  return diffKeys(
    before.map((d) => d.id),
    after.map((d) => d.id),
  );
}
