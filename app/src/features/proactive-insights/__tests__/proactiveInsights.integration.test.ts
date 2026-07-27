import { processCoachConversationTurn } from "../../coach-conversation/application";
import {
  createCoachConversationRequest,
  createTestCoachConversationService,
} from "../../coach-conversation/testSupport/fixtures";
import { CoachConversationIntents } from "../../coach-conversation/models/CoachConversationIntent";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import { createCompositionRoot, resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  CoachInsightSeverities,
  CoachInsightTypes,
  filterInsights,
  getCriticalInsights,
  getGoalInsights,
  getLatestInsights,
  getNutritionInsights,
  getRecoveryInsights,
  getTopInsights,
  getWorkoutInsights,
  prioritizeInsights,
  validateInsight,
  validateInsights,
} from "../index";
import {
  appendSeedEntry,
  createInsightClock,
  createTestProactiveInsightsService,
  FIXED_INSIGHT_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Proactive Coach Insights integration (Sprint 25.5)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("detects fatigue pattern", () => {
    const clock = createInsightClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    appendSeedEntry(timeline, {
      id: "fatigue:1",
      category: CoachTimelineEventCategories.FATIGUE_DETECTED,
      summary: "Fatigue detected after dense sessions",
      reason: "Elevated fatigue score",
      impact: "Readiness declined",
      expectedOutcome: "Reduce load",
      affectedDomain: "recovery",
      createdAt: clock.now(),
    });
    clock.advance(1000);
    appendSeedEntry(timeline, {
      id: "fatigue:2",
      category: CoachTimelineEventCategories.FATIGUE_DETECTED,
      summary: "Fatigue detected again",
      reason: "Repeated fatigue signal",
      impact: "Recovery pressure",
      expectedOutcome: "Recovery day",
      affectedDomain: "recovery",
      createdAt: clock.now(),
    });

    const service = createTestProactiveInsightsService({
      coachTimeline: timeline,
      clock: clock.now,
    });
    const result = service.analyze({ athleteId: "athlete:1" });
    expect(
      result.insights.some(
        (insight) => insight.type === CoachInsightTypes.FATIGUE_PATTERN,
      ),
    ).toBe(true);
  });

  it("detects recovery decline", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "rec:1",
      category: CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
      summary: "Recovery adjustment for declining readiness",
      reason: "Readiness declined",
      impact: "Load reduced due to fatigue",
      expectedOutcome: "Stabilize recovery",
      affectedDomain: "recovery",
    });
    appendSeedEntry(timeline, {
      id: "rec:2",
      category: CoachTimelineEventCategories.FATIGUE_DETECTED,
      summary: "Fatigue detected",
      reason: "Fatigue rising",
      impact: "Recovery decline",
      expectedOutcome: "Rest",
      affectedDomain: "recovery",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    const types = service
      .analyze({ athleteId: "athlete:1" })
      .insights.map((insight) => insight.type);
    expect(types).toContain(CoachInsightTypes.RECOVERY_DECLINE);
  });

  it("detects goal plateau / stall", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "goal:stall:1",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Goal plateau detected",
      reason: "Progress stalled on primary goal",
      impact: "Plateau risk rising",
      expectedOutcome: "Review stimulus",
      affectedDomain: "goal",
    });
    appendSeedEntry(timeline, {
      id: "goal:stall:2",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Still plateaued",
      reason: "No progress this week",
      impact: "Stall continues",
      expectedOutcome: "Adjust plan",
      affectedDomain: "goal",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    const types = service
      .analyze({ athleteId: "athlete:1" })
      .insights.map((insight) => insight.type);
    expect(types).toContain(CoachInsightTypes.GOAL_STALL);
    expect(types).toContain(CoachInsightTypes.PLATEAU_RISK);
  });

  it("detects goal acceleration", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "goal:accel:1",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Goal progressing well",
      reason: "Athlete is progressing ahead of checkpoint",
      impact: "Acceleration observed",
      expectedOutcome: "Maintain pattern",
      affectedDomain: "goal",
    });
    appendSeedEntry(timeline, {
      id: "goal:accel:2",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Continued improvement",
      reason: "On track and accelerating",
      impact: "Positive velocity",
      expectedOutcome: "Keep course",
      affectedDomain: "goal",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(
      service
        .analyze({ athleteId: "athlete:1" })
        .insights.some(
          (insight) => insight.type === CoachInsightTypes.GOAL_ACCELERATION,
        ),
    ).toBe(true);
  });

  it("detects repeated workout modifications", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 3; i += 1) {
      appendSeedEntry(timeline, {
        id: `mod:w:${i}`,
        category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
        summary: `Workout modified #${i}`,
        reason: "Surgical plan change",
        impact: "Plan updated",
        expectedOutcome: "Train updated plan",
        affectedDomain: "workout",
      });
    }
    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(
      service
        .getWorkoutInsights("athlete:1")
        .some(
          (insight) => insight.type === CoachInsightTypes.MODIFICATION_PATTERN,
        ),
    ).toBe(true);
  });

  it("detects repeated nutrition modifications", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 3; i += 1) {
      appendSeedEntry(timeline, {
        id: `mod:n:${i}`,
        category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
        summary: `Nutrition modified #${i}`,
        reason: "Diet adjustment",
        impact: "Nutrition plan updated",
        expectedOutcome: "Follow updated meals",
        affectedDomain: "nutrition",
      });
    }
    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(
      service
        .getNutritionInsights("athlete:1")
        .some(
          (insight) => insight.type === CoachInsightTypes.MODIFICATION_PATTERN,
        ),
    ).toBe(true);
  });

  it("detects repeated restores", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "restore:1",
      category: CoachTimelineEventCategories.WORKOUT_RESTORED,
      summary: "Workout restored to prior version",
      reason: "Athlete requested undo",
      impact: "Prior version republished",
      expectedOutcome: "Stable restored plan",
      affectedDomain: "workout",
    });
    appendSeedEntry(timeline, {
      id: "restore:2",
      category: CoachTimelineEventCategories.NUTRITION_RESTORED,
      summary: "Nutrition restored",
      reason: "Undo diet change",
      impact: "Prior nutrition republished",
      expectedOutcome: "Stable diet",
      affectedDomain: "nutrition",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(
      service
        .analyze({ athleteId: "athlete:1" })
        .insights.some(
          (insight) => insight.type === CoachInsightTypes.RESTORE_PATTERN,
        ),
    ).toBe(true);
  });

  it("detects volume reduction pattern", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "vol:1",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Reduced volume for recovery",
      reason: "Coach chose to reduce volume",
      impact: "Lower training volume",
      expectedOutcome: "Better recovery",
      affectedDomain: "workout",
    });
    appendSeedEntry(timeline, {
      id: "vol:2",
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: "Volume lowered again",
      reason: "Further volume decrease",
      impact: "Volume cut",
      expectedOutcome: "Manage fatigue",
      affectedDomain: "workout",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(
      service
        .analyze({ athleteId: "athlete:1" })
        .insights.some(
          (insight) => insight.type === CoachInsightTypes.TRAINING_VOLUME,
        ),
    ).toBe(true);
  });

  it("detects missed session pattern", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "miss:1",
      category: CoachTimelineEventCategories.SYSTEM_EVENT,
      summary: "Missed session recorded",
      reason: "Athlete skipped workout",
      impact: "Compliance gap",
      expectedOutcome: "Reschedule",
      affectedDomain: "workout",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    const types = service
      .analyze({ athleteId: "athlete:1" })
      .insights.map((insight) => insight.type);
    expect(types).toContain(CoachInsightTypes.MISSED_SESSIONS);
    expect(types).toContain(CoachInsightTypes.WORKOUT_COMPLIANCE);
  });

  it("prioritizes insights by severity then confidence", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 5; i += 1) {
      appendSeedEntry(timeline, {
        id: `fatigue:prio:${i}`,
        category: CoachTimelineEventCategories.FATIGUE_DETECTED,
        summary: `Fatigue ${i}`,
        reason: "Fatigue",
        impact: "Load risk",
        expectedOutcome: "Recover",
        affectedDomain: "recovery",
      });
    }
    appendSeedEntry(timeline, {
      id: "miss:prio:1",
      category: CoachTimelineEventCategories.USER_REQUEST,
      summary: "Missed session note",
      reason: "Skipped workout",
      impact: "Attendance",
      expectedOutcome: "Return",
      affectedDomain: "workout",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    const insights = prioritizeInsights(
      service.analyze({ athleteId: "athlete:1" }).insights,
    );
    expect(insights.length).toBeGreaterThan(0);
    expect(
      insights[0]!.severity === CoachInsightSeverities.CRITICAL ||
        insights[0]!.severity === CoachInsightSeverities.HIGH,
    ).toBe(true);
    for (let i = 1; i < insights.length; i += 1) {
      const prev = insights[i - 1]!;
      const curr = insights[i]!;
      const order = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      } as const;
      expect(order[prev.severity]).toBeLessThanOrEqual(order[curr.severity]);
    }
  });

  it("filters insights by domain and type", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 2; i += 1) {
      appendSeedEntry(timeline, {
        id: `fatigue:filter:${i}`,
        category: CoachTimelineEventCategories.FATIGUE_DETECTED,
        summary: `Fatigue ${i}`,
        reason: "Fatigue",
        impact: "Risk",
        expectedOutcome: "Recover",
        affectedDomain: "recovery",
      });
    }
    appendSeedEntry(timeline, {
      id: "goal:filter:1",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Goal plateau",
      reason: "Progress stalled",
      impact: "Plateau",
      expectedOutcome: "Review",
      affectedDomain: "goal",
    });
    appendSeedEntry(timeline, {
      id: "goal:filter:2",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Still stalled",
      reason: "No progress",
      impact: "Stall",
      expectedOutcome: "Adjust",
      affectedDomain: "goal",
    });

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    const all = service.analyze({ athleteId: "athlete:1" }).insights;
    const recoveryOnly = filterInsights(
      all,
      Object.freeze({ domains: Object.freeze(["recovery" as const]) }),
    );
    expect(recoveryOnly.every((insight) => insight.affectedDomain === "recovery")).toBe(
      true,
    );
    expect(getRecoveryInsights({ athleteId: "athlete:1", service }).length).toBe(
      recoveryOnly.length,
    );
    expect(getGoalInsights({ athleteId: "athlete:1", service }).length).toBeGreaterThan(
      0,
    );
  });

  it("answers conversation insight queries from generated insights only", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 2; i += 1) {
      appendSeedEntry(timeline, {
        id: `fatigue:conv:${i}`,
        category: CoachTimelineEventCategories.FATIGUE_DETECTED,
        summary: `Fatigue ${i}`,
        reason: "Fatigue rising",
        impact: "Recovery pressure",
        expectedOutcome: "Deload",
        affectedDomain: "recovery",
      });
    }
    const insights = createTestProactiveInsightsService({ coachTimeline: timeline });
    const conversation = createTestCoachConversationService({
      coachTimeline: timeline,
      proactiveInsights: insights,
    });

    const result = processCoachConversationTurn({
      service: conversation,
      request: createCoachConversationRequest({
        id: "req:insight:1",
        message: "Anything I should know?",
        createdAt: FIXED_INSIGHT_TIMESTAMP,
      }),
    });

    expect(result.intent).toBe(CoachConversationIntents.COACH_INSIGHT);
    expect(result.response!.message).toContain("From proactive coach insights:");
    expect(result.context!.insightResult?.matchedCount).toBeGreaterThan(0);
  });

  it("exposes dashboard APIs for top/latest/critical/domain insights", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 5; i += 1) {
      appendSeedEntry(timeline, {
        id: `fatigue:dash:${i}`,
        category: CoachTimelineEventCategories.FATIGUE_DETECTED,
        summary: `Fatigue ${i}`,
        reason: "Fatigue",
        impact: "Risk",
        expectedOutcome: "Recover",
        affectedDomain: "recovery",
      });
    }
    for (let i = 1; i <= 3; i += 1) {
      appendSeedEntry(timeline, {
        id: `mod:dash:${i}`,
        category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
        summary: `Workout modified ${i}`,
        reason: "Change",
        impact: "Updated",
        expectedOutcome: "Train",
        affectedDomain: "workout",
      });
    }

    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(getTopInsights({ athleteId: "athlete:1", service, limit: 3 }).length).toBeLessThanOrEqual(
      3,
    );
    expect(getLatestInsights({ athleteId: "athlete:1", service }).length).toBeGreaterThan(0);
    expect(getCriticalInsights({ athleteId: "athlete:1", service }).length).toBeGreaterThan(0);
    expect(getWorkoutInsights({ athleteId: "athlete:1", service }).length).toBeGreaterThan(0);
    expect(getRecoveryInsights({ athleteId: "athlete:1", service }).length).toBeGreaterThan(0);
  });

  it("reports validation failures for incomplete insights", () => {
    const invalid = Object.freeze({
      id: "",
      athleteId: "",
      timestamp: "",
      type: "NOT_A_TYPE" as never,
      severity: "NOPE" as never,
      evidence: Object.freeze({
        keys: Object.freeze([]),
        timelineEntryIds: Object.freeze([]),
        signalCount: 0,
        sourceDomains: Object.freeze([]),
        summary: "",
      }),
      reason: Object.freeze({
        decisionId: null,
        recommendationId: null,
        explanationId: null,
        reason: "",
        impact: "",
        evidenceKeys: Object.freeze([]),
      }),
      recommendation: Object.freeze({
        action: "",
        rationale: "",
        expectedOutcome: "",
        relatedRecommendationId: null,
      }),
      confidence: 2,
      relatedTimelineEntryIds: Object.freeze([]),
      affectedDomain: "nope" as never,
      expectedOutcome: "",
      title: "",
      summary: "",
      metadata: Object.freeze({}),
    });

    const result = validateInsight(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);

    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "valid:1",
      category: CoachTimelineEventCategories.FATIGUE_DETECTED,
      summary: "Fatigue A",
      reason: "Fatigue",
      impact: "Risk",
      expectedOutcome: "Recover",
      affectedDomain: "recovery",
    });
    appendSeedEntry(timeline, {
      id: "valid:2",
      category: CoachTimelineEventCategories.FATIGUE_DETECTED,
      summary: "Fatigue B",
      reason: "Fatigue",
      impact: "Risk",
      expectedOutcome: "Recover",
      affectedDomain: "recovery",
    });
    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    expect(validateInsights(service.analyze({ athleteId: "athlete:1" }).insights).valid).toBe(
      true,
    );
  });

  it("keeps insight models immutable", () => {
    const timeline = createTestCoachTimelineService();
    for (let i = 1; i <= 2; i += 1) {
      appendSeedEntry(timeline, {
        id: `imm:${i}`,
        category: CoachTimelineEventCategories.FATIGUE_DETECTED,
        summary: `Fatigue ${i}`,
        reason: "Fatigue",
        impact: "Risk",
        expectedOutcome: "Recover",
        affectedDomain: "recovery",
      });
    }
    const service = createTestProactiveInsightsService({ coachTimeline: timeline });
    const insight = service.analyze({ athleteId: "athlete:1" }).insights[0]!;
    expect(service.isImmutable(insight)).toBe(true);
    expect(Object.isFrozen(insight.evidence.keys)).toBe(true);
    const originalTitle = insight.title;
    try {
      // @ts-expect-error immutability guard
      insight.title = "mutated";
    } catch {
      // strict-mode engines throw; non-strict ignore
    }
    expect(insight.title).toBe(originalTitle);
  });

  it("wires ProactiveInsightsService in Composition Root", () => {
    const root = createCompositionRoot();
    const insights = root.getProactiveInsightsService();
    expect(insights).toBeDefined();
    expect(root.resolve("ProactiveInsightsService")).toBe(insights);
  });
});
