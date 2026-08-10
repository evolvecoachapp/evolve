import { GoalProgressLoadingStatuses } from "../models";
import {
  emptyMockGoalProgressExperienceService,
  mockGoalProgressExperienceService,
} from "../providers/MockGoalProgressExperienceService";
import type { GoalProgressExperienceService } from "../services";
import { GoalProgressExperienceError } from "../services";
import { GoalProgressExperienceViewModel } from "../viewmodels";

describe("GoalProgressExperienceViewModel", () => {
  it("loads dashboard goal progress data", async () => {
    const viewModel = new GoalProgressExperienceViewModel({
      service: mockGoalProgressExperienceService,
    });
    await viewModel.loadDashboard();
    expect(viewModel.loading.status).toBe(GoalProgressLoadingStatuses.IDLE);
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard?.goalId).toBeTruthy();
  });

  it("exposes error state when provider fails", async () => {
    const failing: GoalProgressExperienceService = {
      providerId: "mock",
      async getDashboard() {
        throw new GoalProgressExperienceError("load failed", "mock");
      },
      async updateProgress() {
        throw new GoalProgressExperienceError("update failed", "mock");
      },
      async completeMilestone() {
        throw new GoalProgressExperienceError("milestone failed", "mock");
      },
      async completeGoal() {
        throw new GoalProgressExperienceError("complete failed", "mock");
      },
    };
    const viewModel = new GoalProgressExperienceViewModel({ service: failing });
    await viewModel.loadDashboard();
    expect(viewModel.dashboard).toBeNull();
    expect(viewModel.error?.message).toContain("load failed");
  });

  it("refresh restores dashboard after a transient error", async () => {
    let calls = 0;
    const service: GoalProgressExperienceService = {
      providerId: "mock",
      async getDashboard() {
        calls += 1;
        if (calls === 1) {
          throw new GoalProgressExperienceError("transient", "mock");
        }
        return mockGoalProgressExperienceService.getDashboard();
      },
      updateProgress: mockGoalProgressExperienceService.updateProgress,
      completeMilestone: mockGoalProgressExperienceService.completeMilestone,
      completeGoal: mockGoalProgressExperienceService.completeGoal,
    };
    const viewModel = new GoalProgressExperienceViewModel({ service });
    await viewModel.loadDashboard();
    expect(viewModel.error).not.toBeNull();
    await viewModel.refresh();
    expect(viewModel.error).toBeNull();
    expect(viewModel.dashboard).not.toBeNull();
  });

  it("updates progress through the mock provider", async () => {
    const viewModel = new GoalProgressExperienceViewModel({
      service: mockGoalProgressExperienceService,
    });
    await viewModel.loadDashboard();
    const before = viewModel.dashboard?.completionPercent ?? 0;
    await viewModel.updateProgress();
    expect(viewModel.dashboard?.completionPercent).toBeGreaterThan(before);
  });

  it("completes milestone through the mock provider", async () => {
    const viewModel = new GoalProgressExperienceViewModel({
      service: mockGoalProgressExperienceService,
    });
    await viewModel.loadDashboard();
    const milestoneId = viewModel.dashboard?.milestones[0]?.id;
    expect(milestoneId).toBeTruthy();
    await viewModel.completeMilestone(milestoneId!);
    expect(viewModel.dashboard?.milestones[0]?.reached).toBe(true);
  });

  it("exposes empty state from empty mock provider", async () => {
    const viewModel = new GoalProgressExperienceViewModel({
      service: emptyMockGoalProgressExperienceService,
    });
    await viewModel.loadDashboard();
    expect(viewModel.isEmpty).toBe(true);
  });

  it("applyHydratedGoalProgress marks runtime-driven mode", () => {
    const viewModel = new GoalProgressExperienceViewModel({ athleteId: "athlete:1" });
    viewModel.applyHydratedGoalProgress({
      goalId: "goal:1",
      headline: "Test goal",
      summary: "Summary",
      category: "performance",
      currentValue: 50,
      targetValue: 100,
      unit: "percent",
      completionPercent: 50,
      status: "on_track",
      milestones: Object.freeze([]),
      checkpoints: Object.freeze([]),
      updateAvailable: true,
      completeAvailable: false,
      isCompleted: false,
      historyDestination: "/(app)/goals",
    });
    expect(viewModel.isRuntimeDriven).toBe(true);
    expect(viewModel.dashboard?.headline).toBe("Test goal");
  });
});
