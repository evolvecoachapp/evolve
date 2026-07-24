import { buildEmptyAthleteState, buildAthleteStateDescriptor } from "../builders/AthleteStateBuilder";
import { buildAthleteSnapshot } from "../builders/SnapshotBuilder";
import { buildStateSummary } from "../builders/SummaryBuilder";
import { appendTimelineChange, buildEmptyTimeline } from "../builders/TimelineBuilder";
import { trackStateChange } from "../evolution/ChangeTracker";
import { INITIAL_STATE_VERSION } from "../models/StateVersion";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state builders", () => {
  it("builds empty state, summary, snapshot, timeline", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(state.version).toEqual(INITIAL_STATE_VERSION);
    expect(Object.isFrozen(state)).toBe(true);

    const summary = buildStateSummary({ state, createdAt: FIXED_TIMESTAMP });
    expect(summary.headline).toContain("athlete:1");

    const snapshot = buildAthleteSnapshot({
      id: "snapshot:1",
      state,
      summary,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(snapshot.athleteId).toBe("athlete:1");

    const change = trackStateChange({
      id: "change:1",
      athleteId: "athlete:1",
      fromVersion: null,
      toVersion: state.version,
      paths: ["profile"],
      summary: "build",
      source: "build",
      changedAt: FIXED_TIMESTAMP,
    });
    const timeline = appendTimelineChange({
      timeline: buildEmptyTimeline("athlete:1"),
      change,
      itemId: "timeline:1",
    });
    expect(timeline.items).toHaveLength(1);

    const descriptor = buildAthleteStateDescriptor({
      id: "runtime:athlete-state",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.name).toBe("Athlete State Engine");
    expect(descriptor.capabilities.length).toBe(5);
  });
});
