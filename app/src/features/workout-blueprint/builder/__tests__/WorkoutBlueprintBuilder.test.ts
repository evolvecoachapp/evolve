import { WorkoutBlueprintBuilder } from "../WorkoutBlueprintBuilder";
import { WorkoutBlueprintError } from "../../models/WorkoutBlueprintError";
import {
  createWorkoutBlueprintAIOutput,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("WorkoutBlueprintBuilder", () => {
  const builder = new WorkoutBlueprintBuilder();

  it("builds an immutable blueprint from AI strategic output", () => {
    const blueprint = builder.build(createWorkoutBlueprintAIOutput(), {
      createdAt: FIXED_TIMESTAMP,
      athleteId: "athlete-1",
      source: "ai",
    });

    expect(blueprint.split.type).toBe("upper_lower");
    expect(blueprint.weeklyFrequency).toBe(4);
    expect(blueprint.metadata.source).toBe("ai");
    expect(Object.isFrozen(blueprint)).toBe(true);
    expect(Object.isFrozen(blueprint.split)).toBe(true);
    expect(Object.isFrozen(blueprint.days)).toBe(true);
  });

  it("normalizes sparse AI output into a complete blueprint", () => {
    const blueprint = builder.build(
      {
        split: { type: "full_body", daysPerWeek: 3, cycleLengthDays: 7 },
        priority: { primary: "strength", secondary: null },
      },
      { id: "sparse-1", createdAt: FIXED_TIMESTAMP, source: "ai" },
    );

    expect(blueprint.id).toBe("sparse-1");
    expect(blueprint.split.type).toBe("full_body");
    expect(blueprint.days.length).toBeGreaterThan(0);
    expect(blueprint.blocks.length).toBe(1);
    expect(blueprint.weeklyFrequency).toBe(3);
  });

  it("throws when normalized output remains invalid", () => {
    expect(() =>
      builder.build({
        id: "bad",
        split: { type: "upper_lower", daysPerWeek: 4, cycleLengthDays: 7 },
        priority: { primary: "hypertrophy", secondary: null },
        focus: { primary: "full_body", secondary: null },
        constraints: [],
        blocks: [
          {
            id: "block-1",
            name: "primary",
            order: 0,
            weekCount: 4,
            priority: { primary: "hypertrophy", secondary: null },
            focus: { primary: "full_body", secondary: null },
          },
        ],
        days: [
          {
            id: "day-1",
            dayIndex: 0,
            name: "Upper",
            isRestDay: false,
            focus: { primary: "upper_body", secondary: null },
            sessionGoal: "primary_lift_emphasis",
            estimatedDurationMinutes: 60,
          },
        ],
        weeklyFrequency: 2,
        metadata: {
          version: "1.0.0",
          source: "ai",
          athleteId: null,
          createdAt: FIXED_TIMESTAMP,
          tags: [],
        },
      }),
    ).toThrow(WorkoutBlueprintError);
  });
});
