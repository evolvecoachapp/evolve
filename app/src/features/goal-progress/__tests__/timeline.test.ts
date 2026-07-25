import { buildGoalHistory } from "../timeline/HistoryTimelineBuilder";
import { buildTimelineSnapshot } from "../timeline/SnapshotTimelineBuilder";
import { buildGoalTimeline } from "../timeline/GoalTimelineBuilder";
import { buildTrendItems } from "../timeline/MilestoneTimelineBuilder";
import { buildGoalTrend } from "../timeline/WindowBuilder";
import {
  createGoalProgressInput,
  createTestGoalProgressEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { GoalProgressInputKinds } from "../models/GoalProgressInput";

describe("goal-progress timeline", () => {
  it("organizes history only without forecasting", () => {
    const service = createTestGoalProgressEngineService();
    const result = service.evaluateGoalProgress(
      createGoalProgressInput({ kind: GoalProgressInputKinds.EVALUATE }),
    );
    expect(result.success).toBe(true);
    const decisions = result.decisions;

    const timeline = buildGoalTimeline({
      id: "tl:1",
      athleteId: "athlete:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(timeline)).toBe(true);
    expect(timeline.items.length).toBe(decisions.length);

    const history = buildGoalHistory({
      id: "hist:1",
      athleteId: "athlete:1",
      decisions,
      historyKeys: Object.freeze(["history:prior"]),
      at: FIXED_TIMESTAMP,
    });
    expect(history.entries.length).toBeGreaterThan(0);

    const trends = buildTrendItems({
      trendKeys: Object.freeze(["trend:signal", "other"]),
      at: FIXED_TIMESTAMP,
    });
    expect(trends).toHaveLength(1);

    const window = buildGoalTrend({
      id: "win:1",
      timeline,
      startAt: FIXED_TIMESTAMP,
      endAt: FIXED_TIMESTAMP,
    });
    expect(window.itemIds.length).toBe(timeline.items.length);

    const snap = buildTimelineSnapshot({
      id: "snap:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary: result.summary,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(snap)).toBe(true);
  });
});
