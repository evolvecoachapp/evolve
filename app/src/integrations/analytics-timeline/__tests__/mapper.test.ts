import { CoachTimelineEventCategories } from "../../../features/coach-timeline/models/CoachTimelineEvent";
import {
  mapAnalyticsEventToTimelineRequest,
  mapGoalProgressIngestToTimelineRequest,
  mapNutritionProgressIngestToTimelineRequest,
  mapRecoveryProgressIngestToTimelineRequest,
  mapWorkoutProgressIngestToTimelineRequest,
} from "../mappers";
import {
  createTestGoalAnalyticsTimelineEvent,
  createTestGoalProgressIngestDto,
  createTestNutritionProgressIngestDto,
  createTestRecoveryProgressIngestDto,
  createTestWorkoutProgressIngestDto,
  FIXED_ATHLETE_ID,
} from "../testSupport/fixtures";

describe("analytics-timeline mappers", () => {
  it("maps goal progress ingest events to timeline requests", () => {
    const request = mapGoalProgressIngestToTimelineRequest(
      createTestGoalProgressIngestDto({ eventId: "evt-map-goal" }),
    );

    expect(request.id).toBe("tl:analytics:goal:evt-map-goal");
    expect(request.athleteId).toBe(FIXED_ATHLETE_ID);
    expect(request.category).toBe(CoachTimelineEventCategories.GOAL_PROGRESS);
    expect(request.affectedDomain).toBe("goal");
  });

  it("maps goal completed events to GOAL_CHANGED category", () => {
    const request = mapGoalProgressIngestToTimelineRequest(
      createTestGoalProgressIngestDto({
        eventType: "GoalCompleted",
      }),
    );

    expect(request.category).toBe(CoachTimelineEventCategories.GOAL_CHANGED);
  });

  it("maps workout progress ingest events to timeline requests", () => {
    const request = mapWorkoutProgressIngestToTimelineRequest(
      createTestWorkoutProgressIngestDto(),
    );

    expect(request.category).toBe(CoachTimelineEventCategories.WORKOUT_CREATED);
    expect(request.affectedDomain).toBe("workout");
  });

  it("maps nutrition progress ingest events to timeline requests", () => {
    const request = mapNutritionProgressIngestToTimelineRequest(
      createTestNutritionProgressIngestDto(),
    );

    expect(request.category).toBe(CoachTimelineEventCategories.NUTRITION_MODIFIED);
    expect(request.affectedDomain).toBe("nutrition");
  });

  it("maps recovery progress ingest events to timeline requests", () => {
    const request = mapRecoveryProgressIngestToTimelineRequest(
      createTestRecoveryProgressIngestDto(),
    );

    expect(request.category).toBe(CoachTimelineEventCategories.RECOVERY_ADJUSTMENT);
    expect(request.affectedDomain).toBe("recovery");
  });

  it("routes analytics events through domain mappers", () => {
    const request = mapAnalyticsEventToTimelineRequest(
      createTestGoalAnalyticsTimelineEvent({ eventId: "evt-map-router" }),
    );

    expect(request.id).toBe("tl:analytics:goal:evt-map-router");
  });
});
