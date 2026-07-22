import {
  calculateTrainingFrequency,
  calculateWeeklyVolumeDistribution,
  estimateSessionComplexity,
  freezeBlueprint,
  normalizeBlueprint,
} from "../index";
import {
  createWorkoutBlueprint,
  createWorkoutDayBlueprint,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("workout-blueprint utilities", () => {
  it("freezeBlueprint deep-freezes nested structures", () => {
    const frozen = freezeBlueprint(createWorkoutBlueprint());
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.days[0])).toBe(true);
    expect(Object.isFrozen(frozen.metadata.tags)).toBe(true);
  });

  it("normalizeBlueprint fills defaults for sparse input", () => {
    const normalized = normalizeBlueprint(
      { split: { type: "push_pull_legs" } },
      { id: "norm-1", createdAt: FIXED_TIMESTAMP, source: "derived" },
    );

    expect(normalized.id).toBe("norm-1");
    expect(normalized.split.type).toBe("push_pull_legs");
    expect(normalized.split.daysPerWeek).toBe(6);
    expect(normalized.days.length).toBe(7);
    expect(normalized.metadata.source).toBe("derived");
  });

  it("calculateWeeklyVolumeDistribution returns focus shares", () => {
    const distribution = calculateWeeklyVolumeDistribution(
      createWorkoutBlueprint(),
    );

    expect(distribution.upper_body).toBeGreaterThan(0);
    expect(distribution.lower_body).toBeGreaterThan(0);
    const total = Object.values(distribution).reduce(
      (sum, value) => sum + value,
      0,
    );
    expect(total).toBeCloseTo(1, 5);
  });

  it("calculateTrainingFrequency counts training days", () => {
    expect(calculateTrainingFrequency(createWorkoutBlueprint())).toBe(4);
  });

  it("estimateSessionComplexity scores strategic day intent", () => {
    expect(
      estimateSessionComplexity(
        createWorkoutDayBlueprint({
          sessionGoal: "primary_lift_emphasis",
          focus: { primary: "upper_body", secondary: "push" },
          estimatedDurationMinutes: 90,
        }),
      ),
    ).toBe(5);
    expect(
      estimateSessionComplexity(
        createWorkoutDayBlueprint({ isRestDay: true, sessionGoal: "rest" }),
      ),
    ).toBe(0);
  });
});
