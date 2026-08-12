import { ApiError } from "../../../../api/client";
import { GoalProgressExperienceError } from "../../services";
import { mapBackendGoalProgressToExperienceDto } from "../../mappers/mapBackendGoalProgressToExperienceDto";

jest.mock("../../../../api/goals", () => ({
  listGoals: jest.fn(),
  updateGoal: jest.fn(),
}));

jest.mock("../../../../api/progress", () => ({
  listProgressEntries: jest.fn(),
}));

// Imported after the mocks are registered so the provider module picks up the mocked functions.
import { backendGoalProgressExperienceService } from "../BackendGoalProgressExperienceService";

const mockedListGoals = jest.requireMock("../../../../api/goals")
  .listGoals as jest.MockedFunction<typeof import("../../../../api/goals").listGoals>;
const mockedUpdateGoal = jest.requireMock("../../../../api/goals")
  .updateGoal as jest.MockedFunction<typeof import("../../../../api/goals").updateGoal>;
const mockedListProgressEntries = jest.requireMock("../../../../api/progress")
  .listProgressEntries as jest.MockedFunction<
  typeof import("../../../../api/progress").listProgressEntries
>;

function buildGoal(overrides: Record<string, unknown> = {}) {
  return {
    id: "goal-1",
    user_id: "user-1",
    goal_type: "strength_target" as const,
    description: "Squat 150 kg",
    target_metric_type: "lift_pr" as const,
    target_value: "150.00",
    target_unit: "kg",
    target_exercise_id: "exercise-squat",
    start_date: "2026-01-01",
    target_date: "2026-06-01",
    status: "active" as const,
    priority: "high" as const,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildProgressEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: "entry-1",
    user_id: "user-1",
    goal_id: "goal-1",
    exercise_id: "exercise-squat",
    metric_type: "lift_pr" as const,
    value: "112.50",
    unit: "kg",
    recorded_date: "2026-08-01",
    source: "manual" as const,
    notes: null,
    created_at: "2026-08-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("backendGoalProgressExperienceService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("has the backend provider id", () => {
    expect(backendGoalProgressExperienceService.providerId).toBe("backend");
  });

  describe("authenticated Goal Progress reads", () => {
    it("maps GET /goals + latest GET /progress into the Goal Progress Experience dashboard", async () => {
      mockedListGoals.mockResolvedValueOnce({
        items: [buildGoal()],
        total: 1,
        limit: 20,
        offset: 0,
      });
      mockedListProgressEntries.mockResolvedValueOnce({
        items: [buildProgressEntry()],
        total: 1,
        limit: 1,
        offset: 0,
      });

      const dto = await backendGoalProgressExperienceService.getDashboard();

      expect(mockedListGoals).toHaveBeenCalledWith({
        status: "active",
        limit: 20,
        offset: 0,
      });
      expect(mockedListProgressEntries).toHaveBeenCalledWith({
        goal_id: "goal-1",
        limit: 1,
        offset: 0,
      });
      expect(dto.goalId).toBe("goal-1");
      expect(dto.headline).toBe("Squat 150 kg");
      expect(dto.category).toBe("performance");
      expect(dto.currentValue).toBe(112.5);
      expect(dto.targetValue).toBe(150);
      expect(dto.unit).toBe("kg");
      expect(dto.completionPercent).toBe(75);
      expect(dto.status).toBe("on_track");
      expect(dto.milestones).toHaveLength(0);
      expect(dto.checkpoints).toHaveLength(0);
      expect(dto.updateAvailable).toBe(false);
      expect(dto.completeAvailable).toBe(true);
      expect(dto.isCompleted).toBe(false);
    });

    it("returns the empty dashboard when the user has no active goals", async () => {
      mockedListGoals.mockResolvedValueOnce({
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      });

      const dto = await backendGoalProgressExperienceService.getDashboard();

      expect(mockedListProgressEntries).not.toHaveBeenCalled();
      expect(dto.goalId).toBeNull();
      expect(dto.headline).toBe("No goals yet");
      expect(dto.completeAvailable).toBe(false);
      expect(dto.updateAvailable).toBe(false);
    });
  });

  describe("backend DTO → Goal Progress mapping", () => {
    it("coerces Decimal-as-string target/value fields and does not invent milestones", () => {
      const dto = mapBackendGoalProgressToExperienceDto({
        goal: buildGoal({
          goal_type: "weight_target",
          description: "Reach 75 kg",
          target_metric_type: "body_weight",
          target_value: "75.00",
          target_unit: "kg",
          priority: "medium",
        }),
        latestEntry: buildProgressEntry({
          metric_type: "body_weight",
          value: "80.00",
          unit: "kg",
          exercise_id: null,
        }),
      });

      expect(dto.category).toBe("body_composition");
      expect(dto.currentValue).toBe(80);
      expect(dto.targetValue).toBe(75);
      expect(dto.completionPercent).toBe(100);
      expect(dto.milestones).toEqual([]);
      expect(dto.checkpoints).toEqual([]);
      expect(dto.updateAvailable).toBe(false);
    });

    it("maps achieved goals to a completed Experience dashboard without fabricating progress", () => {
      const dto = mapBackendGoalProgressToExperienceDto({
        goal: buildGoal({ status: "achieved" }),
        latestEntry: null,
      });

      expect(dto.status).toBe("completed");
      expect(dto.isCompleted).toBe(true);
      expect(dto.completeAvailable).toBe(false);
      expect(dto.completionPercent).toBe(100);
      expect(dto.currentValue).toBe(0);
    });
  });

  describe("supported backend mutations", () => {
    it("completes the primary active goal via PATCH /goals/{id} status=achieved", async () => {
      mockedListGoals.mockResolvedValueOnce({
        items: [buildGoal()],
        total: 1,
        limit: 20,
        offset: 0,
      });
      mockedUpdateGoal.mockResolvedValueOnce(buildGoal({ status: "achieved" }));
      mockedListProgressEntries.mockResolvedValueOnce({
        items: [buildProgressEntry({ value: "150.00" })],
        total: 1,
        limit: 1,
        offset: 0,
      });

      const dto = await backendGoalProgressExperienceService.completeGoal();

      expect(mockedUpdateGoal).toHaveBeenCalledWith("goal-1", { status: "achieved" });
      expect(dto.isCompleted).toBe(true);
      expect(dto.status).toBe("completed");
      expect(dto.completeAvailable).toBe(false);
      expect(dto.completionPercent).toBe(100);
      expect(dto.currentValue).toBe(150);
    });

    it("does not report success when no active goal exists to complete", async () => {
      mockedListGoals.mockResolvedValueOnce({
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      });

      await expect(backendGoalProgressExperienceService.completeGoal()).rejects.toThrow(
        /No active goal/,
      );
      expect(mockedUpdateGoal).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("wraps a network/API failure as a GoalProgressExperienceError, never the raw exception", async () => {
      mockedListGoals.mockRejectedValueOnce(new ApiError(500, null, "Internal Server Error"));

      const failure = backendGoalProgressExperienceService.getDashboard();

      await expect(failure).rejects.toBeInstanceOf(GoalProgressExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("surfaces a backend validation failure as a GoalProgressExperienceError", async () => {
      mockedListGoals.mockResolvedValueOnce({
        items: [buildGoal()],
        total: 1,
        limit: 20,
        offset: 0,
      });
      mockedUpdateGoal.mockRejectedValueOnce(
        new ApiError(
          422,
          { detail: "At least one field must be provided." },
          "At least one field must be provided.",
        ),
      );

      const failure = backendGoalProgressExperienceService.completeGoal();

      await expect(failure).rejects.toBeInstanceOf(GoalProgressExperienceError);
      await expect(failure).rejects.toThrow(/At least one field/);
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("does not report success when the backend completion PATCH fails", async () => {
      mockedListGoals.mockResolvedValueOnce({
        items: [buildGoal()],
        total: 1,
        limit: 20,
        offset: 0,
      });
      mockedUpdateGoal.mockRejectedValueOnce(new ApiError(503, null, "Service Unavailable"));

      await expect(backendGoalProgressExperienceService.completeGoal()).rejects.toThrow(
        "Service Unavailable",
      );
    });
  });

  describe("unsupported Goal Progress operations", () => {
    it.each([
      ["updateProgress", () => backendGoalProgressExperienceService.updateProgress()],
      [
        "completeMilestone",
        () => backendGoalProgressExperienceService.completeMilestone("milestone-1"),
      ],
    ])("%s stays explicitly unsupported by the backend", async (_name, call) => {
      await expect(call()).rejects.toBeInstanceOf(GoalProgressExperienceError);
      await expect(call()).rejects.toThrow(/not supported by the backend/i);
      expect(mockedListGoals).not.toHaveBeenCalled();
      expect(mockedUpdateGoal).not.toHaveBeenCalled();
      expect(mockedListProgressEntries).not.toHaveBeenCalled();
    });
  });
});
