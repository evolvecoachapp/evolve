import type {
  GoalProgressIngestDto,
  NutritionProgressIngestDto,
  RecoveryProgressIngestDto,
  WorkoutProgressIngestDto,
} from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { createAnalyticsTimelineEvent } from "../models";

export const FIXED_ANALYTICS_PUBLISHED_AT = "2026-08-02T20:00:00.000Z";
export const FIXED_ATHLETE_ID = "athlete-analytics-001";

export function createTestGoalProgressIngestDto(
  overrides: Partial<GoalProgressIngestDto> = {},
): GoalProgressIngestDto {
  return Object.freeze({
    eventId: "evt-goal-analytics-001",
    eventType: "GoalProgressUpdated",
    occurredAt: FIXED_ANALYTICS_PUBLISHED_AT,
    metadata: Object.freeze({
      source: "goal",
      correlationId: "corr-analytics-001",
      goalId: "goal-analytics-001",
      snapshotId: null,
      athleteId: FIXED_ATHLETE_ID,
      publishedAt: FIXED_ANALYTICS_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      goalId: "goal-analytics-001",
      snapshotId: null,
      title: "Squat 150 kg",
      category: "performance",
      currentValue: 75,
      targetValue: 100,
      unit: "percent",
      completionPercent: 75,
      status: "on_track",
      evaluatedAt: null,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export function createTestWorkoutProgressIngestDto(
  overrides: Partial<WorkoutProgressIngestDto> = {},
): WorkoutProgressIngestDto {
  return Object.freeze({
    eventId: "evt-workout-analytics-001",
    eventType: "WorkoutCompleted",
    occurredAt: FIXED_ANALYTICS_PUBLISHED_AT,
    metadata: Object.freeze({
      source: "workout",
      correlationId: "corr-analytics-001",
      sessionId: "session-analytics-001",
      workoutId: "workout-analytics-001",
      athleteId: FIXED_ATHLETE_ID,
      publishedAt: FIXED_ANALYTICS_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      sessionId: "session-analytics-001",
      workoutId: "workout-analytics-001",
      workoutTitle: "Upper Body Strength",
      exerciseId: null,
      exerciseName: null,
      setId: null,
      setNumber: null,
      weightKg: null,
      reps: null,
      volumeKg: 4200,
      durationMinutes: 55,
      exerciseCount: 6,
      rpeAverage: 7.5,
      personalRecordId: null,
      estimatedOneRepMaxKg: null,
      completedAt: FIXED_ANALYTICS_PUBLISHED_AT,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export function createTestNutritionProgressIngestDto(
  overrides: Partial<NutritionProgressIngestDto> = {},
): NutritionProgressIngestDto {
  return Object.freeze({
    eventId: "evt-nutrition-analytics-001",
    eventType: "MealLogged",
    occurredAt: FIXED_ANALYTICS_PUBLISHED_AT,
    metadata: Object.freeze({
      source: "nutrition",
      correlationId: "corr-analytics-001",
      dayId: "day-analytics-001",
      mealPlanId: null,
      athleteId: FIXED_ATHLETE_ID,
      publishedAt: FIXED_ANALYTICS_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      dayId: "day-analytics-001",
      mealPlanId: null,
      mealId: "meal-analytics-001",
      mealName: "Post-workout meal",
      mealEntryId: null,
      foodId: null,
      foodName: null,
      servings: null,
      calories: 650,
      proteinGrams: 45,
      carbohydrateGrams: 60,
      fatGrams: 18,
      hydrationMl: null,
      targetHydrationMl: null,
      mealsLogged: 3,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export function createTestRecoveryProgressIngestDto(
  overrides: Partial<RecoveryProgressIngestDto> = {},
): RecoveryProgressIngestDto {
  return Object.freeze({
    eventId: "evt-recovery-analytics-001",
    eventType: "RecoveryAssessed",
    occurredAt: FIXED_ANALYTICS_PUBLISHED_AT,
    metadata: Object.freeze({
      source: "recovery",
      correlationId: "corr-analytics-001",
      dayId: "day-analytics-001",
      assessmentId: "assessment-analytics-001",
      athleteId: FIXED_ATHLETE_ID,
      publishedAt: FIXED_ANALYTICS_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      dayId: "day-analytics-001",
      assessmentId: "assessment-analytics-001",
      recoveryScore: 78,
      readinessScore: 80,
      readinessLabel: "ready",
      fatigueLevel: 2,
      fatigueLabel: "low",
      sleepHours: 7.5,
      sleepQuality: 85,
      stressLevel: 2,
      stressLabel: "low",
      hrvScore: 62,
      restingHeartRate: 52,
      trainingLoadScore: 65,
      assessedAt: FIXED_ANALYTICS_PUBLISHED_AT,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export function createTestGoalAnalyticsTimelineEvent(
  eventOverrides: Partial<GoalProgressIngestDto> = {},
) {
  return createAnalyticsTimelineEvent({
    source: "goal",
    event: createTestGoalProgressIngestDto(eventOverrides),
  });
}

export function createTestWorkoutAnalyticsTimelineEvent(
  eventOverrides: Partial<WorkoutProgressIngestDto> = {},
) {
  return createAnalyticsTimelineEvent({
    source: "workout",
    event: createTestWorkoutProgressIngestDto(eventOverrides),
  });
}

export function createTestNutritionAnalyticsTimelineEvent(
  eventOverrides: Partial<NutritionProgressIngestDto> = {},
) {
  return createAnalyticsTimelineEvent({
    source: "nutrition",
    event: createTestNutritionProgressIngestDto(eventOverrides),
  });
}

export function createTestRecoveryAnalyticsTimelineEvent(
  eventOverrides: Partial<RecoveryProgressIngestDto> = {},
) {
  return createAnalyticsTimelineEvent({
    source: "recovery",
    event: createTestRecoveryProgressIngestDto(eventOverrides),
  });
}
