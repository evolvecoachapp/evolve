import { aggregateWorkout } from "../aggregation/WorkoutAggregator";
import { aggregateContextSlices } from "../aggregation/ContextAggregator";
import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion aggregation", () => {
  it("aggregates workout slice from contribution", () => {
    const contribution = createMockWorkoutAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const slice = aggregateWorkout({
      current: null,
      contributions: [contribution],
    });
    expect(slice).not.toBeNull();
    expect(slice!.facts.focus).toBe("strength");
  });

  it("aggregates all slices into context shell", () => {
    const contribution = createMockWorkoutAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const empty = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const next = aggregateContextSlices({
      context: empty,
      contributions: [contribution],
      updatedAt: FIXED_TIMESTAMP,
    });
    expect(next.workout!.facts.programId).toBe("program:1");
    expect(next.nutrition).toBeNull();
  });
});
