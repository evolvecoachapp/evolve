import { buildAdaptationHistory } from "../timeline/HistoryBuilder";
import { buildTimelineSnapshot } from "../timeline/SnapshotBuilder";
import { buildAdaptationTimeline } from "../timeline/TimelineBuilder";
import { buildTrendItems } from "../timeline/TrendBuilder";
import { buildAdaptationWindow } from "../timeline/WindowBuilder";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AdaptationInputKinds } from "../models/AdaptationInput";

describe("continuous-adaptation timeline", () => {
  it("organizes history only without forecasting", () => {
    const service = createTestContinuousAdaptationEngineService();
    const result = service.evaluateAdaptation(
      createAdaptationInput({ kind: AdaptationInputKinds.EVALUATE }),
    );
    expect(result.success).toBe(true);
    const decisions = result.decisions;

    const timeline = buildAdaptationTimeline({
      id: "tl:1",
      athleteId: "athlete:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(timeline)).toBe(true);
    expect(timeline.items.length).toBe(decisions.length);

    const history = buildAdaptationHistory({
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

    const window = buildAdaptationWindow({
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
