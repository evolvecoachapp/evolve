import { mapBackendGoalProgressToExperienceDto } from "../mapBackendGoalProgressToExperienceDto";
import type { GoalReadDto, ProgressEntryReadDto } from "../../../../types/api";

function buildGoal(overrides: Partial<GoalReadDto> = {}): GoalReadDto {
  return {
    id: "goal-1",
    user_id: "user-1",
    goal_type: "habit",
    description: "Train 4x per week",
    target_metric_type: null,
    target_value: null,
    target_unit: null,
    target_exercise_id: null,
    start_date: "2026-01-01",
    target_date: null,
    status: "active",
    priority: "low",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildEntry(overrides: Partial<ProgressEntryReadDto> = {}): ProgressEntryReadDto {
  return {
    id: "entry-1",
    user_id: "user-1",
    goal_id: "goal-1",
    exercise_id: null,
    metric_type: "body_weight",
    value: "70",
    unit: "kg",
    recorded_date: "2026-08-01",
    source: "manual",
    notes: null,
    created_at: "2026-08-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("mapBackendGoalProgressToExperienceDto", () => {
  it("returns the empty dashboard when no goal is provided", () => {
    const dto = mapBackendGoalProgressToExperienceDto({ goal: null });
    expect(dto.goalId).toBeNull();
    expect(dto.headline).toBe("No goals yet");
    expect(dto.milestones).toEqual([]);
  });

  it("uses percent placeholders for habit goals without numeric targets", () => {
    const dto = mapBackendGoalProgressToExperienceDto({ goal: buildGoal() });
    expect(dto.currentValue).toBe(0);
    expect(dto.targetValue).toBe(100);
    expect(dto.unit).toBe("percent");
    expect(dto.completionPercent).toBe(0);
    expect(dto.completeAvailable).toBe(true);
    expect(dto.updateAvailable).toBe(false);
  });

  it("does not invent a current value when no progress entry exists", () => {
    const dto = mapBackendGoalProgressToExperienceDto({
      goal: buildGoal({
        goal_type: "strength_target",
        target_metric_type: "lift_pr",
        target_value: "100",
        target_unit: "kg",
      }),
      latestEntry: null,
    });
    expect(dto.currentValue).toBe(0);
    expect(dto.completionPercent).toBe(0);
  });

  it("prefers the latest progress entry unit when the goal has no target unit", () => {
    const dto = mapBackendGoalProgressToExperienceDto({
      goal: buildGoal({
        goal_type: "strength_target",
        target_metric_type: "lift_pr",
        target_value: "100",
        target_unit: null,
      }),
      latestEntry: buildEntry({ value: "40", unit: "kg", metric_type: "lift_pr" }),
    });
    expect(dto.unit).toBe("kg");
    expect(dto.currentValue).toBe(40);
    expect(dto.completionPercent).toBe(40);
  });
});
