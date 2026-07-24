import { aggregateTraining } from "../aggregation/TrainingAggregator";
import { aggregateGoals } from "../aggregation/GoalAggregator";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { createMockGoalAgentPort } from "../contracts/GoalAgentPort";
import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state aggregation", () => {
  it("aggregates training contribution without calculations", () => {
    const empty = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const contribution = createMockWorkoutAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const training = aggregateTraining({
      current: empty.training,
      contributions: [contribution],
    });
    expect(training.focus).toBe("strength");
    expect(training.sourceAgentIds).toContain("agent:workout");
  });

  it("merges goals by id", () => {
    const empty = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const contribution = createMockGoalAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const goals = aggregateGoals({
      current: empty.goals,
      contributions: [contribution],
    });
    expect(goals.items).toHaveLength(1);
    expect(goals.primaryGoalId).toBe("goal:1");
  });
});
