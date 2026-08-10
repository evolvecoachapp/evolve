import type {
  GoalProgressDashboardDto,
  GoalProgressExperienceService,
} from "../services/GoalProgressExperienceService";

function buildPopulatedDashboard(): GoalProgressDashboardDto {
  return Object.freeze({
    goalId: "goal:mock-001",
    headline: "Squat 150 kg",
    summary: "Priority 1 · Severity moderate · 1 checkpoints · 1 milestones",
    category: "performance",
    currentValue: 75,
    targetValue: 100,
    unit: "percent",
    completionPercent: 75,
    status: "on_track",
    milestones: Object.freeze([
      Object.freeze({
        id: "milestone:mock-001",
        label: "First strength milestone",
        category: "performance",
        reached: false,
      }),
    ]),
    checkpoints: Object.freeze([
      Object.freeze({ id: "checkpoint:mock-001", label: "Weekly consistency checkpoint" }),
    ]),
    updateAvailable: true,
    completeAvailable: false,
    isCompleted: false,
    historyDestination: "/(app)/(tabs)/progress",
  });
}

function buildEmptyDashboard(): GoalProgressDashboardDto {
  return Object.freeze({
    goalId: null,
    headline: "No goals yet",
    summary: "Set a training goal to start tracking progress.",
    category: null,
    currentValue: 0,
    targetValue: 100,
    unit: "percent",
    completionPercent: 0,
    status: "",
    milestones: Object.freeze([]),
    checkpoints: Object.freeze([]),
    updateAvailable: false,
    completeAvailable: false,
    isCompleted: false,
    historyDestination: "/(app)/(tabs)/progress",
  });
}

let currentDashboard = buildPopulatedDashboard();

export const mockGoalProgressExperienceService: GoalProgressExperienceService = {
  providerId: "mock",

  async getDashboard() {
    return currentDashboard;
  },

  async updateProgress() {
    currentDashboard = Object.freeze({
      ...currentDashboard,
      currentValue: Math.min(100, currentDashboard.currentValue + 5),
      completionPercent: Math.min(100, currentDashboard.completionPercent + 5),
      status: "on_track",
    });
    return currentDashboard;
  },

  async completeMilestone(milestoneId: string) {
    currentDashboard = Object.freeze({
      ...currentDashboard,
      milestones: Object.freeze(
        currentDashboard.milestones.map((milestone) =>
          milestone.id === milestoneId
            ? Object.freeze({ ...milestone, reached: true })
            : milestone,
        ),
      ),
      completeAvailable: currentDashboard.milestones.every(
        (milestone) => milestone.id === milestoneId || milestone.reached,
      ),
    });
    return currentDashboard;
  },

  async completeGoal() {
    currentDashboard = Object.freeze({
      ...currentDashboard,
      completionPercent: 100,
      currentValue: 100,
      status: "completed",
      isCompleted: true,
      completeAvailable: false,
      updateAvailable: false,
    });
    return currentDashboard;
  },
};

export const emptyMockGoalProgressExperienceService: GoalProgressExperienceService = {
  providerId: "mock",
  async getDashboard() {
    return buildEmptyDashboard();
  },
  async updateProgress() {
    return buildEmptyDashboard();
  },
  async completeMilestone() {
    return buildEmptyDashboard();
  },
  async completeGoal() {
    return buildEmptyDashboard();
  },
};

export function resetMockGoalProgressExperienceData(): void {
  currentDashboard = buildPopulatedDashboard();
}
