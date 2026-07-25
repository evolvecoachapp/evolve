import { compareDecisionIds } from "../comparison/DecisionComparator";
import { compareGoalKeys } from "../comparison/GoalComparator";
import { compareRecommendationIds } from "../comparison/RecommendationComparator";
import { compareSnapshots } from "../comparison/SnapshotComparator";
import { compareStateKeys } from "../comparison/StateComparator";
import { compareTimelines } from "../comparison/TimelineComparator";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("continuous-adaptation comparison", () => {
  it("produces immutable key/id diffs", () => {
    const stateDiff = compareStateKeys(["a", "b"], ["b", "c"]);
    expect(stateDiff.added).toEqual(["c"]);
    expect(stateDiff.removed).toEqual(["a"]);
    expect(stateDiff.shared).toEqual(["b"]);
    expect(Object.isFrozen(stateDiff)).toBe(true);

    expect(compareGoalKeys(["g1"], ["g1", "g2"]).added).toEqual(["g2"]);

    const portIn = {
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    };
    const decisions = createMockDecisionEnginePort().loadDecisions(portIn);
    const recs = createMockRecommendationEnginePort().loadRecommendations(portIn);
    expect(compareDecisionIds(decisions, decisions).shared.length).toBe(3);
    expect(compareRecommendationIds(recs, []).removed.length).toBe(3);

    const snapDiff = compareSnapshots(null, null);
    expect(snapDiff.decisionIds.added).toEqual([]);
    expect(compareTimelines(null, null).shared).toEqual([]);
  });
});
