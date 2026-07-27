import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import { createCompositionRoot, resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import { HomeQuickActionKinds } from "../models/HomeQuickAction";
import {
  buildHomeExperience,
  composeHomeExperience,
  getCoachCard,
  getHomeExperience,
  getHomeSummary,
  getInsightCards,
  getQuickActions,
  validateHomeExperience,
  validateHomeExperienceForAthlete,
} from "../index";
import {
  createHomeClock,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubModification,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestHomeExperienceService,
  FIXED_HOME_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Home Experience integration (Sprint 27.1)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds a workout card from plan, modification, and history", () => {
    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:workout",
      generatedAt: FIXED_HOME_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan({ weekNumber: 4 }),
      modification: createStubModification(),
      planHistory: createStubPlanHistory({ currentVersionNumber: 3 }),
    });

    expect(result.success).toBe(true);
    expect(result.experience?.workout.present).toBe(true);
    expect(result.experience?.workout.currentPhase).toBe("Week 4");
    expect(result.experience?.workout.latestModificationSummary).toContain(
      "Volume reduced",
    );
    expect(result.experience?.workout.planVersion).toBe(3);
    expect(result.experience?.relatedDomains).toContain("workout");
  });

  it("builds a nutrition card from plan and timeline changes", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "nut:1",
      category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
      summary: "Macros redistributed",
      affectedDomain: "nutrition",
    });

    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:nutrition",
      generatedAt: FIXED_HOME_TIMESTAMP,
      nutritionPlan: createStubNutritionPlan({ calories: 2200 }),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    expect(result.success).toBe(true);
    expect(result.experience?.nutrition.present).toBe(true);
    expect(result.experience?.nutrition.macros?.calories).toBe(2200);
    expect(result.experience?.nutrition.latestChangeSummary).toBe(
      "Macros redistributed",
    );
    expect(result.experience?.relatedDomains).toContain("nutrition");
  });

  it("builds a recovery card from metrics, sleep, and notes", () => {
    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:recovery",
      generatedAt: FIXED_HOME_TIMESTAMP,
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile({ hours: 6, label: "fair" }),
      recoveryNotes: Object.freeze(["Reduce intensity today"]),
    });

    expect(result.success).toBe(true);
    expect(result.experience?.recovery.present).toBe(true);
    expect(result.experience?.recovery.sleepHours).toBe(6);
    expect(result.experience?.recovery.sleepLabel).toBe("fair");
    expect(result.experience?.recovery.signalSummaries.length).toBeGreaterThan(
      0,
    );
    expect(result.experience?.relatedDomains).toContain("recovery");
  });

  it("builds a goal card from goal progress", () => {
    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:goal",
      generatedAt: FIXED_HOME_TIMESTAMP,
      goalProgress: createStubGoalProgress(),
    });

    expect(result.success).toBe(true);
    expect(result.experience?.goal.present).toBe(true);
    expect(result.experience?.goal.milestones.length).toBe(1);
    expect(result.experience?.goal.severity).toBe("medium");
    expect(result.experience?.relatedDomains).toContain("goal");
  });

  it("builds a timeline card with decisions, modifications, and restores", () => {
    const clock = createHomeClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    appendSeedEntry(timeline, {
      id: "dec:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Hold intensity",
      createdAt: clock.now(),
    });
    clock.advance(1000);
    appendSeedEntry(timeline, {
      id: "mod:1",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Sets reduced",
      affectedDomain: "workout",
      createdAt: clock.now(),
    });
    clock.advance(1000);
    appendSeedEntry(timeline, {
      id: "res:1",
      category: CoachTimelineEventCategories.WORKOUT_RESTORED,
      summary: "Restored prior plan",
      affectedDomain: "workout",
      createdAt: clock.now(),
    });

    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:timeline",
      generatedAt: clock.now(),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    expect(result.success).toBe(true);
    expect(result.experience?.timeline.present).toBe(true);
    expect(result.experience?.timeline.recentDecisions.length).toBeGreaterThan(
      0,
    );
    expect(result.experience?.timeline.latestModifications.length).toBe(1);
    expect(result.experience?.timeline.restoreEvents.length).toBe(1);
  });

  it("builds a coach card from explainable coaching session", () => {
    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:coach",
      generatedAt: FIXED_HOME_TIMESTAMP,
      coachingSession: createStubCoachingSession({
        headline: "Steady coaching guidance",
      }),
    });

    expect(result.success).toBe(true);
    expect(result.experience?.coach.present).toBe(true);
    expect(result.experience?.coach.recommendation).toContain("Hold intensity");
    expect(result.experience?.coach.expectedOutcome).toBe(
      "Maintain progress safely",
    );
    expect(result.experience?.coach.confidenceLevel).toBe("medium");
  });

  it("builds insight cards preferring critical and high severity", () => {
    const insights = Object.freeze([
      createStubInsight({
        id: "ins:low",
        severity: CoachInsightSeverities.LOW,
        title: "Minor note",
        confidence: 0.4,
      }),
      createStubInsight({
        id: "ins:crit",
        severity: CoachInsightSeverities.CRITICAL,
        title: "Overreach risk",
        confidence: 0.9,
      }),
      createStubInsight({
        id: "ins:high",
        severity: CoachInsightSeverities.HIGH,
        title: "Volume rising",
        confidence: 0.7,
      }),
    ]);

    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:insights",
      generatedAt: FIXED_HOME_TIMESTAMP,
      insights,
    });

    expect(result.success).toBe(true);
    expect(result.experience?.insights[0]?.id).toBe("ins:crit");
    expect(result.experience?.insights[1]?.id).toBe("ins:high");
    expect(result.experience?.insights[0]?.recommendation).toBe("Reduce volume");
  });

  it("generates deterministic quick actions from card presence", () => {
    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:actions",
      generatedAt: FIXED_HOME_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      nutritionPlan: createStubNutritionPlan(),
      goalProgress: createStubGoalProgress(),
      planHistory: createStubPlanHistory({ currentVersionNumber: 2 }),
      insights: Object.freeze([createStubInsight({ id: "ins:1" })]),
      timelineEntries: Object.freeze([]),
      coachingSession: createStubCoachingSession(),
    });

    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "tl:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
    });

    const withTimeline = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:actions-tl",
      generatedAt: FIXED_HOME_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      nutritionPlan: createStubNutritionPlan(),
      goalProgress: createStubGoalProgress(),
      planHistory: createStubPlanHistory({ currentVersionNumber: 2 }),
      insights: Object.freeze([createStubInsight({ id: "ins:1" })]),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
      coachingSession: createStubCoachingSession(),
    });

    expect(result.success).toBe(true);
    const actions = withTimeline.experience!.quickActions;
    expect(
      actions.find((a) => a.kind === HomeQuickActionKinds.RESUME_WORKOUT)
        ?.enabled,
    ).toBe(true);
    expect(
      actions.find((a) => a.kind === HomeQuickActionKinds.CONTINUE_NUTRITION)
        ?.enabled,
    ).toBe(true);
    expect(
      actions.find((a) => a.kind === HomeQuickActionKinds.REVIEW_GOAL)?.enabled,
    ).toBe(true);
    expect(
      actions.find((a) => a.kind === HomeQuickActionKinds.SEE_TIMELINE)?.enabled,
    ).toBe(true);
    expect(
      actions.find((a) => a.kind === HomeQuickActionKinds.VIEW_INSIGHTS)
        ?.enabled,
    ).toBe(true);
    expect(
      actions.find((a) => a.kind === HomeQuickActionKinds.RESTORE_PREVIOUS_PLAN)
        ?.enabled,
    ).toBe(true);
  });

  it("exposes dashboard APIs after composition", () => {
    const service = createTestHomeExperienceService();
    const composed = composeHomeExperience({
      service,
      input: {
        athleteId: "athlete:1",
        requestId: "req:dash",
        workoutPlan: createStubWorkoutPlan(),
        insights: Object.freeze([createStubInsight({ id: "ins:dash" })]),
        coachingSession: createStubCoachingSession(),
      },
    });

    expect(composed.success).toBe(true);
    expect(getHomeExperience({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(getHomeSummary({ athleteId: "athlete:1", service })?.headline).toBe(
      "Your coaching home is ready",
    );
    expect(getQuickActions({ athleteId: "athlete:1", service }).length).toBe(6);
    expect(getCoachCard({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
    expect(getInsightCards({ athleteId: "athlete:1", service }).length).toBe(1);
  });

  it("reports validation failures for incomplete experiences", () => {
    const invalid = validateHomeExperience(null);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain("Home experience is missing");

    const service = createTestHomeExperienceService();
    expect(
      validateHomeExperienceForAthlete({ athleteId: "athlete:missing", service })
        .valid,
    ).toBe(false);
  });

  it("freezes immutable home experience models", () => {
    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:immutable",
      generatedAt: FIXED_HOME_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      insights: Object.freeze([createStubInsight({ id: "ins:imm" })]),
    });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result.experience)).toBe(true);
    expect(Object.isFrozen(result.experience?.workout)).toBe(true);
    expect(Object.isFrozen(result.experience?.insights)).toBe(true);
    expect(Object.isFrozen(result.experience?.quickActions)).toBe(true);
    expect(Object.isFrozen(result.experience?.summary)).toBe(true);
    expect(validateHomeExperience(result.experience).valid).toBe(true);
  });

  it("composes a full home experience from multiple domains", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "full:1",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Adjusted volume",
      affectedDomain: "workout",
    });

    const result = buildHomeExperience({
      athleteId: "athlete:1",
      requestId: "req:full",
      generatedAt: FIXED_HOME_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      modification: createStubModification(),
      planHistory: createStubPlanHistory(),
      nutritionPlan: createStubNutritionPlan(),
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile(),
      goalProgress: createStubGoalProgress(),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
      insights: Object.freeze([
        createStubInsight({
          id: "ins:full",
          severity: CoachInsightSeverities.CRITICAL,
        }),
      ]),
      coachingSession: createStubCoachingSession(),
    });

    expect(result.success).toBe(true);
    expect(result.experience?.summary.presentCardCount).toBeGreaterThanOrEqual(
      5,
    );
    expect(result.experience?.relatedDomains).toEqual(
      expect.arrayContaining([
        "workout",
        "nutrition",
        "recovery",
        "goal",
        "timeline",
        "coach",
      ]),
    );
  });

  it("registers HomeExperienceService in Composition Root", () => {
    const root = createCompositionRoot();
    expect(root.resolve("HomeExperienceService")).toBeDefined();
    expect(root.getHomeExperienceService()).toBe(
      root.resolve("HomeExperienceService"),
    );
  });
});
