import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export function compareRecommendationIds(
  before: readonly CoachingRecommendation[],
  after: readonly CoachingRecommendation[],
): KeyDiff {
  return diffKeys(
    before.map((r) => r.id),
    after.map((r) => r.id),
  );
}
