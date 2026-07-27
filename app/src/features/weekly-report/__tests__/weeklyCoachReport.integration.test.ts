import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import { WeeklyConfidenceLevels } from "../models/WeeklyConfidence";
import {
  buildDecisionReport,
  buildEvidence,
  buildInsightReport,
  buildWeeklyCoachReport,
  buildWorkoutReport,
  calculateWeeklyConfidence,
  composeWeeklyCoachReport,
  getDecisionReport,
  getExecutiveSummary,
  getGoalReport,
  getNutritionReport,
  getRecommendationReport,
  getRecoveryReport,
  getWeeklyCoachReport,
  getWorkoutReport,
  validateWeeklyCoachReport,
  validateWeeklyCoachReportForAthlete,
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
  createTestWeeklyCoachReportService,
  FIXED_REPORT_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Weekly Coach Report integration (Sprint 27.3)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds an executive summary from daily brief, home, and session signals", () => {
    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:exec",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      coachingSession: createStubCoachingSession({
        headline: "Steady weekly guidance",
      }),
      insights: Object.freeze([createStubInsight({ id: "ins:exec" })]),
    });

    expect(result.success).toBe(true);
    expect(result.executiveSummary?.headline).toContain("weekly coach report");
    expect(result.executiveSummary?.presentSectionCount).toBeGreaterThan(0);
    expect(result.executiveSummary?.weeklyHighlights.length).toBeGreaterThan(0);
    expect(result.report?.executiveSummary.athleteId).toBe("athlete:1");
  });

  it("builds a workout report from plan, modification, history, and compliance", () => {
    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:workout",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan({ weekNumber: 4 }),
      modification: createStubModification(),
      planHistory: createStubPlanHistory({ currentVersionNumber: 3 }),
      completedWorkoutCount: 3,
    });

    expect(result.success).toBe(true);
    expect(result.report?.workout.present).toBe(true);
    expect(result.report?.workout.currentPhase).toBe("Week 4");
    expect(result.report?.workout.completedWorkoutCount).toBe(3);
    expect(result.report?.workout.latestModificationSummary).toContain(
      "Volume reduced",
    );
    expect(result.report?.relatedDomains).toContain("workout");
  });

  it("builds a nutrition report from plan and weekly macro changes", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "nut:1",
      category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
      summary: "Macros redistributed",
      affectedDomain: "nutrition",
    });

    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:nutrition",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      nutritionPlan: createStubNutritionPlan({ calories: 2200 }),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    expect(result.success).toBe(true);
    expect(result.report?.nutrition.present).toBe(true);
    expect(result.report?.nutrition.macros?.calories).toBe(2200);
    expect(result.report?.nutrition.macroChangeCount).toBe(1);
    expect(result.report?.nutrition.latestChangeSummary).toBe(
      "Macros redistributed",
    );
    expect(result.report?.relatedDomains).toContain("nutrition");
  });

  it("builds a recovery report from fatigue, sleep, and trends", () => {
    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:recovery",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile({ hours: 6, label: "fair" }),
      fatigueTrend: "Elevated mid-week",
      sleepTrend: "Below target",
      recoveryTrend: "Improving late week",
    });

    expect(result.success).toBe(true);
    expect(result.report?.recovery.present).toBe(true);
    expect(result.report?.recovery.sleepHours).toBe(6);
    expect(result.report?.recovery.fatigueTrend).toBe("Elevated mid-week");
    expect(result.report?.recovery.recoveryTrend).toBe("Improving late week");
    expect(result.report?.relatedDomains).toContain("recovery");
  });

  it("builds a goal report from progress and remaining objectives", () => {
    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:goal",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      goalProgress: createStubGoalProgress(),
    });

    expect(result.success).toBe(true);
    expect(result.report?.goals.present).toBe(true);
    expect(result.report?.goals.milestones.length).toBe(1);
    expect(result.report?.goals.remainingObjectiveCount).toBe(1);
    expect(result.report?.relatedDomains).toContain("goal");
  });

  it("builds an insight report with weekly patterns and top insights", () => {
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

    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:insights",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      insights,
    });

    expect(result.success).toBe(true);
    expect(result.report?.insights.present).toBe(true);
    expect(result.report?.insights.items[0]?.id).toBe("ins:crit");
    expect(result.report?.insights.criticalCount).toBe(1);
    expect(result.report?.insights.topInsights[0]).toBe("Overreach risk");
    expect(result.report?.insights.patternSummaries.length).toBeGreaterThan(0);
  });

  it("builds a decision report from timeline decisions and interventions", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "dec:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Hold intensity",
      affectedDomain: "workout",
    });
    appendSeedEntry(timeline, {
      id: "dec:2",
      category: CoachTimelineEventCategories.WORKOUT_RESTORED,
      summary: "Restored prior plan",
      affectedDomain: "workout",
    });
    appendSeedEntry(timeline, {
      id: "dec:3",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Volume cut",
      affectedDomain: "workout",
    });

    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:decisions",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    expect(result.success).toBe(true);
    expect(result.report?.decisions.present).toBe(true);
    expect(result.report?.decisions.decisionCount).toBe(3);
    expect(result.report?.decisions.restoreCount).toBe(1);
    expect(result.report?.decisions.modificationCount).toBe(1);
    expect(result.report?.decisions.interventionCount).toBe(1);
    expect(result.report?.relatedDomains).toContain("decision");
  });

  it("builds a recommendation report with next-week focus", () => {
    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:rec",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      coachingSession: createStubCoachingSession({
        headline: "Steady coaching guidance",
      }),
      focusForNextWeek: "Protect recovery while holding intensity",
    });

    expect(result.success).toBe(true);
    expect(result.report?.recommendations.present).toBe(true);
    expect(result.report?.recommendations.focusForNextWeek).toBe(
      "Protect recovery while holding intensity",
    );
    expect(result.report?.recommendations.expectedOutcome).toBe(
      "Maintain progress safely",
    );
    expect(result.report?.relatedDomains).toContain("recommendation");
  });

  it("projects evidence references without inventing evidence", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "ev:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Decision evidence",
    });

    const workout = buildWorkoutReport({
      workoutPlan: createStubWorkoutPlan(),
    });
    const insights = buildInsightReport({
      insights: Object.freeze([createStubInsight({ id: "ins:ev" })]),
    });
    const decisions = buildDecisionReport({
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
    });

    const evidence = buildEvidence({
      reportId: "weekly-report:ev",
      coachingSession: createStubCoachingSession(),
      timelineEntries: timeline.getTimeline("athlete:1")?.entries,
      planHistory: createStubPlanHistory(),
      workout,
      nutrition: Object.freeze({
        present: false,
        planId: null,
        macros: null,
        phaseHint: null,
        macroChangeCount: 0,
        latestChangeSummary: null,
        adherenceSummary: null,
        complianceSummary: null,
        summary: "none",
      }),
      recovery: Object.freeze({
        present: false,
        status: null,
        fatigueScore: null,
        sleepLabel: null,
        sleepHours: null,
        fatigueTrend: null,
        sleepTrend: null,
        recoveryTrend: null,
        signalSummaries: Object.freeze([]),
        summary: "none",
      }),
      goals: Object.freeze({
        present: false,
        goalId: null,
        category: null,
        progressSummary: null,
        milestones: Object.freeze([]),
        remainingObjectiveCount: 0,
        severity: null,
        summary: "none",
      }),
      insights,
      decisions,
      recommendations: Object.freeze({
        present: true,
        sessionId: "coach-session:1",
        recommendationIds: Object.freeze(["rec:1"]),
        titles: Object.freeze(["Hold intensity"]),
        recommendationSummary: "Hold intensity this week",
        expectedOutcome: "Maintain progress safely",
        focusForNextWeek: "Hold intensity this week",
        confidenceLevel: "medium",
        confidenceScore: 0.5,
        summary: "Hold intensity this week",
      }),
    });

    expect(evidence.present).toBe(true);
    expect(evidence.items.length).toBeGreaterThan(0);
    expect(evidence.timelineEntryIds).toContain("ev:1");
    expect(evidence.coachingSessionId).toBe("coach-session:1");
    expect(evidence.summary).toContain("evidence reference");
  });

  it("calculates confidence only from available evidence", () => {
    const emptyEvidence = buildEvidence({
      reportId: "empty",
      workout: buildWorkoutReport({}),
      nutrition: Object.freeze({
        present: false,
        planId: null,
        macros: null,
        phaseHint: null,
        macroChangeCount: 0,
        latestChangeSummary: null,
        adherenceSummary: null,
        complianceSummary: null,
        summary: "none",
      }),
      recovery: Object.freeze({
        present: false,
        status: null,
        fatigueScore: null,
        sleepLabel: null,
        sleepHours: null,
        fatigueTrend: null,
        sleepTrend: null,
        recoveryTrend: null,
        signalSummaries: Object.freeze([]),
        summary: "none",
      }),
      goals: Object.freeze({
        present: false,
        goalId: null,
        category: null,
        progressSummary: null,
        milestones: Object.freeze([]),
        remainingObjectiveCount: 0,
        severity: null,
        summary: "none",
      }),
      insights: buildInsightReport({}),
      decisions: buildDecisionReport({}),
      recommendations: Object.freeze({
        present: false,
        sessionId: null,
        recommendationIds: Object.freeze([]),
        titles: Object.freeze([]),
        recommendationSummary: null,
        expectedOutcome: null,
        focusForNextWeek: null,
        confidenceLevel: null,
        confidenceScore: null,
        summary: "none",
      }),
    });

    const empty = calculateWeeklyConfidence({
      workout: buildWorkoutReport({}),
      nutrition: Object.freeze({
        present: false,
        planId: null,
        macros: null,
        phaseHint: null,
        macroChangeCount: 0,
        latestChangeSummary: null,
        adherenceSummary: null,
        complianceSummary: null,
        summary: "none",
      }),
      recovery: Object.freeze({
        present: false,
        status: null,
        fatigueScore: null,
        sleepLabel: null,
        sleepHours: null,
        fatigueTrend: null,
        sleepTrend: null,
        recoveryTrend: null,
        signalSummaries: Object.freeze([]),
        summary: "none",
      }),
      goals: Object.freeze({
        present: false,
        goalId: null,
        category: null,
        progressSummary: null,
        milestones: Object.freeze([]),
        remainingObjectiveCount: 0,
        severity: null,
        summary: "none",
      }),
      insights: buildInsightReport({}),
      decisions: buildDecisionReport({}),
      recommendations: Object.freeze({
        present: false,
        sessionId: null,
        recommendationIds: Object.freeze([]),
        titles: Object.freeze([]),
        recommendationSummary: null,
        expectedOutcome: null,
        focusForNextWeek: null,
        confidenceLevel: null,
        confidenceScore: null,
        summary: "none",
      }),
      evidence: emptyEvidence,
    });
    expect(empty.level).toBe(WeeklyConfidenceLevels.NONE);
    expect(empty.score).toBe(0);

    const withWorkout = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:conf",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      insights: Object.freeze([createStubInsight({ id: "ins:conf" })]),
      coachingSession: createStubCoachingSession(),
    });
    expect(withWorkout.report?.confidence.evidenceCount).toBeGreaterThan(0);
    expect(withWorkout.report?.confidence.sourceCount).toBeGreaterThan(0);
    expect(withWorkout.report?.confidence.rationale).toContain(
      "Deterministic weekly confidence",
    );
  });

  it("exposes dashboard APIs after composition", () => {
    const service = createTestWeeklyCoachReportService();
    const composed = composeWeeklyCoachReport({
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
    expect(
      getWeeklyCoachReport({ athleteId: "athlete:1", service }),
    ).not.toBeNull();
    expect(
      getExecutiveSummary({ athleteId: "athlete:1", service })?.headline,
    ).toContain("weekly");
    expect(getWorkoutReport({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
    expect(
      getNutritionReport({ athleteId: "athlete:1", service })?.present,
    ).toBe(true);
    expect(
      getRecoveryReport({ athleteId: "athlete:1", service }),
    ).not.toBeNull();
    expect(getGoalReport({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(
      getDecisionReport({ athleteId: "athlete:1", service }),
    ).not.toBeNull();
    expect(
      getRecommendationReport({ athleteId: "athlete:1", service })?.present,
    ).toBe(true);
  });

  it("reports validation failures for incomplete reports", () => {
    const invalid = validateWeeklyCoachReport(null);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain("Weekly coach report is missing");

    const service = createTestWeeklyCoachReportService();
    expect(
      validateWeeklyCoachReportForAthlete({
        athleteId: "athlete:missing",
        service,
      }).valid,
    ).toBe(false);
  });

  it("freezes immutable weekly report models", () => {
    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:immutable",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      insights: Object.freeze([createStubInsight({ id: "ins:imm" })]),
    });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result.report)).toBe(true);
    expect(Object.isFrozen(result.report?.workout)).toBe(true);
    expect(Object.isFrozen(result.report?.insights)).toBe(true);
    expect(Object.isFrozen(result.report?.evidence)).toBe(true);
    expect(Object.isFrozen(result.report?.confidence)).toBe(true);
    expect(Object.isFrozen(result.report?.executiveSummary)).toBe(true);
    expect(validateWeeklyCoachReport(result.report).valid).toBe(true);
  });

  it("composes a complete weekly coach report from multiple domains", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "full:1",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Adjusted volume",
      affectedDomain: "workout",
    });
    appendSeedEntry(timeline, {
      id: "full:2",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Protect recovery",
      affectedDomain: "recovery",
    });

    const result = buildWeeklyCoachReport({
      athleteId: "athlete:1",
      requestId: "req:full",
      generatedAt: FIXED_REPORT_TIMESTAMP,
      workoutPlan: createStubWorkoutPlan(),
      modification: createStubModification(),
      planHistory: createStubPlanHistory(),
      completedWorkoutCount: 4,
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
      focusForNextWeek: "Recover then rebuild",
    });

    expect(result.success).toBe(true);
    expect(result.report?.confidence.evidenceCount).toBeGreaterThan(0);
    expect(result.report?.evidence.present).toBe(true);
    expect(
      result.report?.executiveSummary.presentSectionCount,
    ).toBeGreaterThanOrEqual(5);
    expect(result.report?.relatedDomains).toEqual(
      expect.arrayContaining([
        "workout",
        "nutrition",
        "recovery",
        "goal",
        "decision",
        "recommendation",
      ]),
    );
  });

  it("registers WeeklyCoachReportService in Composition Root", () => {
    const root = createCompositionRoot();
    expect(root.resolve("WeeklyCoachReportService")).toBeDefined();
    expect(root.getWeeklyCoachReportService()).toBe(
      root.resolve("WeeklyCoachReportService"),
    );
  });
});
