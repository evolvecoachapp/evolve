import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import { DailyBriefPriorities } from "../models/DailyBriefPriority";
import { DailyBriefConfidenceLevels } from "../models/DailyBriefConfidence";
import {
  buildDailyBrief,
  buildInsightSection,
  buildWorkoutSection,
  calculateConfidence,
  calculatePriority,
  composeDailyBrief,
  getCoachMessage,
  getDailyBrief,
  getGoalSection,
  getInsightSection,
  getNutritionSection,
  getRecoverySection,
  getWorkoutSection,
  validateDailyBrief,
  validateDailyBriefForAthlete,
} from "../index";
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
} from "../testSupport/fixtures";

describe("Athlete Daily Brief integration (Sprint 27.2)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds a workout brief from plan, modification, and history", () => {
    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:workout",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan({ weekNumber: 4 }),
      modification: createStubModification(),
      planHistory: createStubPlanHistory({ currentVersionNumber: 3 }),
    });

    expect(result.success).toBe(true);
    expect(result.brief?.workout.present).toBe(true);
    expect(result.brief?.workout.currentPhase).toBe("Week 4");
    expect(result.brief?.workout.latestModificationSummary).toContain(
      "Volume reduced",
    );
    expect(result.brief?.workout.planVersion).toBe(3);
    expect(result.brief?.relatedDomains).toContain("workout");
  });

  it("builds a nutrition brief from plan and timeline changes", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "nut:1",
      category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
      summary: "Macros redistributed",
      affectedDomain: "nutrition",
    });

    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:nutrition",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      nutritionPlan: createStubNutritionPlan({ calories: 2200 }),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    expect(result.success).toBe(true);
    expect(result.brief?.nutrition.present).toBe(true);
    expect(result.brief?.nutrition.macros?.calories).toBe(2200);
    expect(result.brief?.nutrition.latestChangeSummary).toBe(
      "Macros redistributed",
    );
    expect(result.brief?.relatedDomains).toContain("nutrition");
  });

  it("builds a recovery brief from metrics, sleep, and notes", () => {
    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:recovery",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile({ hours: 6, label: "fair" }),
      recoveryNotes: Object.freeze(["Reduce intensity today"]),
    });

    expect(result.success).toBe(true);
    expect(result.brief?.recovery.present).toBe(true);
    expect(result.brief?.recovery.sleepHours).toBe(6);
    expect(result.brief?.recovery.sleepLabel).toBe("fair");
    expect(result.brief?.recovery.signalSummaries.length).toBeGreaterThan(0);
    expect(result.brief?.relatedDomains).toContain("recovery");
  });

  it("builds a goal brief from goal progress", () => {
    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:goal",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      goalProgress: createStubGoalProgress(),
    });

    expect(result.success).toBe(true);
    expect(result.brief?.goals.present).toBe(true);
    expect(result.brief?.goals.milestones.length).toBe(1);
    expect(result.brief?.goals.severity).toBe("medium");
    expect(result.brief?.relatedDomains).toContain("goal");
  });

  it("builds an insight brief preferring critical and high severity", () => {
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

    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:insights",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      insights,
    });

    expect(result.success).toBe(true);
    expect(result.brief?.insights.present).toBe(true);
    expect(result.brief?.insights.items[0]?.id).toBe("ins:crit");
    expect(result.brief?.insights.criticalCount).toBe(1);
    expect(result.brief?.insights.topRecommendation).toBe("Reduce volume");
  });

  it("builds a coach message from explainable coaching session and timeline", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "tl:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Hold intensity decision",
    });

    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:coach",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      coachingSession: createStubCoachingSession({
        headline: "Steady coaching guidance",
      }),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    expect(result.success).toBe(true);
    expect(result.brief?.coachMessage.present).toBe(true);
    expect(result.brief?.coachMessage.recommendation).toContain(
      "Hold intensity",
    );
    expect(result.brief?.coachMessage.expectedOutcome).toBe(
      "Maintain progress safely",
    );
    expect(result.brief?.coachMessage.confidenceLevel).toBe("medium");
    expect(result.brief?.coachMessage.timelineSummary).toBe(
      "Hold intensity decision",
    );
  });

  it("calculates priority deterministically from insights and recovery", () => {
    const critical = buildInsightSection({
      insights: Object.freeze([
        createStubInsight({
          id: "ins:c",
          severity: CoachInsightSeverities.CRITICAL,
        }),
      ]),
    });
    expect(
      calculatePriority({
        insights: critical,
        recovery: Object.freeze({
          present: false,
          status: null,
          fatigueScore: null,
          sleepLabel: null,
          sleepHours: null,
          signalSummaries: Object.freeze([]),
          summary: "none",
        }),
        goals: Object.freeze({
          present: false,
          goalId: null,
          category: null,
          progressSummary: null,
          milestones: Object.freeze([]),
          severity: null,
          summary: "none",
        }),
      }),
    ).toBe(DailyBriefPriorities.CRITICAL);

    const emptyInsights = buildInsightSection({ insights: Object.freeze([]) });
    expect(
      calculatePriority({
        insights: emptyInsights,
        recovery: Object.freeze({
          present: false,
          status: null,
          fatigueScore: null,
          sleepLabel: null,
          sleepHours: null,
          signalSummaries: Object.freeze([]),
          summary: "none",
        }),
        goals: Object.freeze({
          present: false,
          goalId: null,
          category: null,
          progressSummary: null,
          milestones: Object.freeze([]),
          severity: null,
          summary: "none",
        }),
        hasWorkout: true,
      }),
    ).toBe(DailyBriefPriorities.NORMAL);

    expect(
      calculatePriority({
        insights: emptyInsights,
        recovery: Object.freeze({
          present: false,
          status: null,
          fatigueScore: null,
          sleepLabel: null,
          sleepHours: null,
          signalSummaries: Object.freeze([]),
          summary: "none",
        }),
        goals: Object.freeze({
          present: false,
          goalId: null,
          category: null,
          progressSummary: null,
          milestones: Object.freeze([]),
          severity: null,
          summary: "none",
        }),
      }),
    ).toBe(DailyBriefPriorities.LOW);
  });

  it("calculates confidence only from available evidence", () => {
    const empty = calculateConfidence({
      workout: buildWorkoutSection({}),
      nutrition: Object.freeze({
        present: false,
        planId: null,
        macros: null,
        phaseHint: null,
        latestChangeSummary: null,
        summary: "none",
      }),
      recovery: Object.freeze({
        present: false,
        status: null,
        fatigueScore: null,
        sleepLabel: null,
        sleepHours: null,
        signalSummaries: Object.freeze([]),
        summary: "none",
      }),
      goals: Object.freeze({
        present: false,
        goalId: null,
        category: null,
        progressSummary: null,
        milestones: Object.freeze([]),
        severity: null,
        summary: "none",
      }),
      insights: buildInsightSection({}),
      coachMessage: Object.freeze({
        present: false,
        sessionId: null,
        headline: null,
        recommendation: null,
        expectedOutcome: null,
        confidenceLevel: null,
        confidenceScore: null,
        timelineSummary: null,
        message: "none",
      }),
    });
    expect(empty.level).toBe(DailyBriefConfidenceLevels.NONE);
    expect(empty.score).toBe(0);
    expect(empty.evidenceCount).toBe(0);

    const withWorkout = calculateConfidence({
      workout: buildWorkoutSection({
        workoutPlan: createStubWorkoutPlan(),
      }),
      nutrition: Object.freeze({
        present: false,
        planId: null,
        macros: null,
        phaseHint: null,
        latestChangeSummary: null,
        summary: "none",
      }),
      recovery: Object.freeze({
        present: false,
        status: null,
        fatigueScore: null,
        sleepLabel: null,
        sleepHours: null,
        signalSummaries: Object.freeze([]),
        summary: "none",
      }),
      goals: Object.freeze({
        present: false,
        goalId: null,
        category: null,
        progressSummary: null,
        milestones: Object.freeze([]),
        severity: null,
        summary: "none",
      }),
      insights: buildInsightSection({
        insights: Object.freeze([createStubInsight({ id: "ins:1" })]),
      }),
      coachMessage: Object.freeze({
        present: true,
        sessionId: "s1",
        headline: "h",
        recommendation: "r",
        expectedOutcome: "o",
        confidenceLevel: "medium",
        confidenceScore: 0.5,
        timelineSummary: null,
        message: "m",
      }),
    });
    expect(withWorkout.evidenceCount).toBeGreaterThan(0);
    expect(withWorkout.sourceCount).toBeGreaterThan(0);
    expect(withWorkout.score).toBeGreaterThan(0);
    expect(withWorkout.rationale).toContain("Deterministic confidence");
  });

  it("exposes dashboard APIs after composition", () => {
    const service = createTestDailyBriefService();
    const composed = composeDailyBrief({
      service,
      input: {
        athleteId: "athlete:1",
        requestId: "req:dash",
        workoutPlan: createStubWorkoutPlan(),
        nutritionPlan: createStubNutritionPlan(),
        insights: Object.freeze([createStubInsight({ id: "ins:dash" })]),
        coachingSession: createStubCoachingSession(),
      },
    });

    expect(composed.success).toBe(true);
    expect(getDailyBrief({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(getCoachMessage({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
    expect(getWorkoutSection({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
    expect(
      getNutritionSection({ athleteId: "athlete:1", service })?.present,
    ).toBe(true);
    expect(getRecoverySection({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(getGoalSection({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(
      getInsightSection({ athleteId: "athlete:1", service })?.items.length,
    ).toBe(1);
  });

  it("reports validation failures for incomplete briefs", () => {
    const invalid = validateDailyBrief(null);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain("Daily brief is missing");

    const service = createTestDailyBriefService();
    expect(
      validateDailyBriefForAthlete({ athleteId: "athlete:missing", service })
        .valid,
    ).toBe(false);
  });

  it("freezes immutable daily brief models", () => {
    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:immutable",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      insights: Object.freeze([createStubInsight({ id: "ins:imm" })]),
    });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result.brief)).toBe(true);
    expect(Object.isFrozen(result.brief?.workout)).toBe(true);
    expect(Object.isFrozen(result.brief?.insights)).toBe(true);
    expect(Object.isFrozen(result.brief?.confidence)).toBe(true);
    expect(Object.isFrozen(result.brief?.summary)).toBe(true);
    expect(validateDailyBrief(result.brief).valid).toBe(true);
  });

  it("composes a full daily brief from multiple domains", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "full:1",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Adjusted volume",
      affectedDomain: "workout",
    });

    const result = buildDailyBrief({
      athleteId: "athlete:1",
      requestId: "req:full",
      generatedAt: FIXED_BRIEF_TIMESTAMP,
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
    expect(result.brief?.priority).toBe(DailyBriefPriorities.CRITICAL);
    expect(result.brief?.confidence.evidenceCount).toBeGreaterThan(0);
    expect(result.brief?.summary.presentSectionCount).toBeGreaterThanOrEqual(5);
    expect(result.brief?.relatedDomains).toEqual(
      expect.arrayContaining([
        "workout",
        "nutrition",
        "recovery",
        "goal",
        "coach",
      ]),
    );
  });

  it("registers DailyBriefService in Composition Root", () => {
    const root = createCompositionRoot();
    expect(root.resolve("DailyBriefService")).toBeDefined();
    expect(root.getDailyBriefService()).toBe(root.resolve("DailyBriefService"));
  });
});
