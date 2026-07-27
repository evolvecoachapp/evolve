import {
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubModification,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestDailyBriefService,
  FIXED_BRIEF_TIMESTAMP,
} from "../../daily-brief/testSupport/fixtures";
import { createHomeExperienceService } from "../../home-experience/services/HomeExperienceService";
import { createCoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import { createExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import { createPlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import { createProactiveInsightsService } from "../../proactive-insights/services/ProactiveInsightsService";
import {
  createWeeklyCoachReportService,
  type WeeklyCoachReportService,
} from "../services/WeeklyCoachReportService";

export const FIXED_REPORT_TIMESTAMP = FIXED_BRIEF_TIMESTAMP;

export {
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubModification,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
};

export function createTestWeeklyCoachReportService(
  overrides: {
    readonly clock?: () => string;
  } = {},
): WeeklyCoachReportService {
  const clock = overrides.clock ?? (() => FIXED_REPORT_TIMESTAMP);
  const coachTimeline = createCoachTimelineService({ clock });
  const planHistory = createPlanHistoryService({ clock });
  const proactiveInsights = createProactiveInsightsService({
    coachTimeline,
    planHistory,
    clock,
  });
  const explainableCoachingSession = createExplainableCoachingSessionService({
    coachTimeline,
    planHistory,
    proactiveInsights,
    clock,
  });
  const homeExperience = createHomeExperienceService({
    coachTimeline,
    planHistory,
    proactiveInsights,
    explainableCoachingSession,
    clock,
  });
  const dailyBrief = createTestDailyBriefService({
    clock,
    coachTimeline,
    planHistory,
    proactiveInsights,
    homeExperience,
  });
  return createWeeklyCoachReportService({
    dailyBrief,
    homeExperience,
    coachTimeline,
    planHistory,
    proactiveInsights,
    explainableCoachingSession,
    clock,
  });
}
