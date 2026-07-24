import {
  buildAthleteState,
  createSnapshot,
  updateAthleteState,
} from "../application";
import { selectPrimaryGoal } from "../selectors/GoalSelector";
import { selectTraining } from "../selectors/StateSelector";
import { selectLatestTimelineItem } from "../selectors/TimelineSelector";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state integration", () => {
  it("aggregates mock specialist agents into supervisor context", () => {
    const service = createTestAthleteStateService({ withMocks: true });
    const built = buildAthleteState({
      service,
      request: createStateRequest(),
    });
    expect(built.success).toBe(true);
    expect(selectTraining(built.state!).focus).toBe("strength");
    expect(built.state!.nutrition.planId).toBe("nutrition-plan:1");
    expect(built.state!.recovery.status).toBe("adequate");
    expect(selectPrimaryGoal(built.state!)?.title).toBe("Increase squat");
    expect(built.state!.coaching.activeSessionId).toBe("session:coach:1");
    expect(built.supervisorContext!.focusAreas).toContain("training");

    const updated = updateAthleteState({
      service,
      request: createStateRequest({
        id: "request:int:update",
        kind: "update",
      }),
    });
    expect(updated.success).toBe(true);
    expect(selectLatestTimelineItem(updated.state!)).not.toBeNull();

    const snap = createSnapshot({
      service,
      request: createStateRequest({
        id: "request:int:snap",
        kind: "snapshot",
      }),
    });
    expect(snap.snapshot!.state.athleteId).toBe("athlete:1");
    expect(snap.supervisorContext!.snapshot).not.toBeNull();
  });
});
