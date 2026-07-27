import { processCoachConversationTurn } from "../../../coach-conversation/application";
import {
  createCoachConversationRequest,
  createTestCoachConversationService,
  generateAndAttachPlan,
} from "../../../coach-conversation/testSupport/fixtures";
import { CoachConversationIntents } from "../../../coach-conversation/models/CoachConversationIntent";
import { CoachConversationStages } from "../../../coach-conversation/models/CoachConversationResult";
import { CoachTimelineEventCategories } from "../../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../../coach-timeline/testSupport/fixtures";
import { createCompositionRoot, resetCompositionRoot } from "../../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../../proactive-insights/testSupport/fixtures";
import {
  calculateSessionConfidence,
  composeCoachingSession,
  getCoachingSessionConfidence,
  getCoachingSessionEvidence,
  getCoachingSessionInsights,
  getCoachingSessionSummary,
  getLatestCoachingSession,
  validateCoachingSession,
  validateExplainableCoachingSession,
} from "../index";
import { collectEvidence } from "../services/collectEvidence";
import { buildCoachingSession } from "../services/buildCoachingSession";
import {
  createSessionClock,
  createTestExplainableCoachingSessionService,
  FIXED_SESSION_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Explainable Coaching Session integration (Sprint 26.1)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds a workout coaching session with plan evidence", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);
    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        message: "Explain today's workout",
      }),
    });
    expect(result.success).toBe(true);
    expect(result.explainableSession).not.toBeNull();
    expect(result.explainableSession?.conversationIntent).toBe(
      CoachConversationIntents.WORKOUT_EXPLANATION,
    );
    expect(
      result.explainableSession?.evidenceUsed.sources,
    ).toContain("workout_plan");
    expect(
      result.trace.some(
        (t) => t.stage === CoachConversationStages.EXPLAINABLE_SESSION,
      ),
    ).toBe(true);
  });

  it("builds a nutrition coaching session from timeline nutrition evidence", () => {
    const clock = createSessionClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    appendSeedEntry(timeline, {
      id: "nut:1",
      category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
      summary: "Nutrition plan adjusted",
      reason: "Calorie target changed",
      impact: "Macros redistributed",
      expectedOutcome: "Improved adherence",
      affectedDomain: "nutrition",
      createdAt: clock.now(),
    });
    const explainable = createTestExplainableCoachingSessionService({
      coachTimeline: timeline,
      clock: clock.now,
    });
    const result = explainable.build({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: "session:1",
      userRequest: "Why did my diet change?",
      conversationIntent: CoachConversationIntents.TIMELINE_QUERY,
      requestId: "req:nutrition",
    });
    expect(result.success).toBe(true);
    expect(result.session?.relatedDomains).toContain("nutrition");
    expect(result.session?.evidenceUsed.sources).toContain("nutrition_plan");
  });

  it("builds a goal coaching session from goal timeline evidence", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "goal:1",
      category: CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: "Goal plateau detected",
      reason: "Progress stalled",
      impact: "Plateau risk",
      expectedOutcome: "Adjust stimulus",
      affectedDomain: "goal",
    });
    const explainable = createTestExplainableCoachingSessionService({
      coachTimeline: timeline,
    });
    const result = explainable.build({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: null,
      userRequest: "How am I progressing?",
      conversationIntent: CoachConversationIntents.COACH_INSIGHT,
      requestId: "req:goal",
      goalSignals: Object.freeze(["plateau"]),
    });
    expect(result.success).toBe(true);
    expect(result.session?.relatedDomains).toContain("goal");
    expect(result.session?.insightSummary.present).toBe(true);
  });

  it("builds a recovery coaching session from recovery evidence", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "rec:1",
      category: CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
      summary: "Recovery day recommended",
      reason: "Readiness declined",
      impact: "Load reduced",
      expectedOutcome: "Stabilize recovery",
      affectedDomain: "recovery",
    });
    const explainable = createTestExplainableCoachingSessionService({
      coachTimeline: timeline,
    });
    const result = explainable.build({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: null,
      userRequest: "Explain recovery",
      conversationIntent: CoachConversationIntents.RECOVERY_EXPLANATION,
      requestId: "req:recovery",
      recoveryNotes: Object.freeze(["Reduce intensity today"]),
    });
    expect(result.success).toBe(true);
    expect(result.session?.relatedDomains).toContain("recovery");
    expect(result.session?.evidenceUsed.sources).toContain("recovery_state");
  });

  it("builds a restore coaching session via conversation", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);
    processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:mod",
        message: "Make the workout shorter",
      }),
    });
    const restore = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:restore",
        message: "Undo my last workout change",
      }),
    });
    expect(restore.explainableSession).not.toBeNull();
    expect(restore.explainableSession?.conversationIntent).toBe(
      CoachConversationIntents.PLAN_RESTORE,
    );
  });

  it("collects timeline references in the session", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "tl:ref:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Volume reduced",
      reason: "Fatigue",
      impact: "Lower sets",
      expectedOutcome: "Recover",
      affectedDomain: "workout",
    });
    const explainable = createTestExplainableCoachingSessionService({
      coachTimeline: timeline,
    });
    const result = explainable.build({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: null,
      userRequest: "Why did volume drop?",
      conversationIntent: CoachConversationIntents.TIMELINE_QUERY,
      requestId: "req:tl",
    });
    expect(result.session?.timelineReferences).toContain("tl:ref:1");
    expect(result.session?.evidenceUsed.timelineEntryIds).toContain("tl:ref:1");
  });

  it("collects evidence without inventing sources", () => {
    const evidence = collectEvidence({
      athleteId: "athlete:1",
      userRequest: "Hello",
      conversationIntent: CoachConversationIntents.GENERAL_COACHING,
    });
    expect(evidence.items.length).toBe(1);
    expect(evidence.sources).toEqual(["conversation_context"]);
    expect(evidence.timelineEntryIds).toEqual([]);
  });

  it("calculates deterministic confidence from evidence", () => {
    const empty = collectEvidence({
      athleteId: "athlete:1",
      userRequest: "x",
      conversationIntent: CoachConversationIntents.UNKNOWN,
    });
    const confEmpty = calculateSessionConfidence(empty);
    expect(confEmpty.score).toBeGreaterThan(0);
    expect(confEmpty.evidenceCount).toBe(1);

    const richer = collectEvidence({
      athleteId: "athlete:1",
      userRequest: "x",
      conversationIntent: CoachConversationIntents.WORKOUT_SUMMARY,
      recommendationTitles: Object.freeze(["Keep progressive overload"]),
      recoveryNotes: Object.freeze(["Sleep well"]),
      goalSignals: Object.freeze(["on track"]),
    });
    const confRich = calculateSessionConfidence(richer);
    expect(confRich.score).toBeGreaterThan(confEmpty.score);
    expect(confRich.score).toBe(
      Math.round((richer.items.length * 0.15 + richer.sources.length * 0.1) * 100) /
        100,
    );
  });

  it("generates a session summary", () => {
    const result = buildCoachingSession({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: "session:1",
      userRequest: "Summarize my plan",
      conversationIntent: CoachConversationIntents.WORKOUT_SUMMARY,
      requestId: "req:summary",
      generatedAt: FIXED_SESSION_TIMESTAMP,
    });
    expect(result.summary?.headline).toContain("workout_summary");
    expect(result.summary?.narrative.length).toBeGreaterThan(0);
  });

  it("integrates with conversation on every turn", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);
    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        message: "Give me general coaching advice",
      }),
    });
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.explainableSession).not.toBeNull();
    expect(result.context?.explainableSession?.id).toBe(
      result.explainableSession?.id,
    );
  });

  it("exposes dashboard APIs for latest session artifacts", () => {
    const explainable = createTestExplainableCoachingSessionService();
    composeCoachingSession({
      service: explainable,
      input: {
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        sessionId: null,
        userRequest: "Anything I should know?",
        conversationIntent: CoachConversationIntents.COACH_INSIGHT,
        requestId: "req:dash",
      },
    });
    expect(getLatestCoachingSession({ athleteId: "athlete:1", service: explainable })).not.toBeNull();
    expect(getCoachingSessionSummary({ athleteId: "athlete:1", service: explainable })).not.toBeNull();
    expect(getCoachingSessionEvidence({ athleteId: "athlete:1", service: explainable })).not.toBeNull();
    expect(getCoachingSessionInsights({ athleteId: "athlete:1", service: explainable })).not.toBeNull();
    expect(getCoachingSessionConfidence({ athleteId: "athlete:1", service: explainable })).not.toBeNull();
    expect(
      validateExplainableCoachingSession({
        athleteId: "athlete:1",
        service: explainable,
      }).valid,
    ).toBe(true);
  });

  it("fails validation for partially built / mutable sessions", () => {
    const invalid = validateCoachingSession(null);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain("Session is missing");

    const mutable = {
      id: "x",
      timestamp: FIXED_SESSION_TIMESTAMP,
      userRequest: "x",
      conversationIntent: CoachConversationIntents.UNKNOWN,
      evidenceUsed: {
        items: [],
        sources: [],
        timelineEntryIds: [],
        planVersionNumbers: [],
        decisionIds: [],
        recommendationIds: [],
        explanationIds: [],
        insightIds: [],
        keys: [],
        summary: "none",
      },
      timelineReferences: [],
      decisionSummary: {
        decisionIds: [],
        titles: [],
        summary: "none",
        present: false,
      },
      recommendationSummary: {
        recommendationIds: [],
        titles: [],
        summary: "none",
        present: false,
      },
      insightSummary: {
        insightIds: [],
        titles: [],
        severities: [],
        summary: "none",
        present: false,
      },
      reasoningSummary: {
        explanationIds: [],
        reasoningPoints: [],
        summary: "none",
        present: false,
      },
      expectedOutcome: "none",
      confidence: {
        level: "none" as const,
        score: 0,
        evidenceCount: 0,
        sourceCount: 0,
        rationale: "none",
      },
      relatedDomains: [],
      context: {
        id: "c",
        athleteId: "a",
        conversationId: "c",
        sessionId: null,
        userRequest: "x",
        conversationIntent: CoachConversationIntents.UNKNOWN,
        lifecycleSessionId: null,
        workoutPlanId: null,
        planLineageId: null,
        relatedDomains: [],
        createdAt: FIXED_SESSION_TIMESTAMP,
      },
      summary: {
        id: "s",
        headline: "h",
        narrative: "n",
        highlights: [],
        generatedAt: FIXED_SESSION_TIMESTAMP,
      },
      metadata: {},
    };
    const result = validateCoachingSession(mutable as never);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("immutable"))).toBe(true);
  });

  it("freezes immutable session models", () => {
    const result = buildCoachingSession({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: null,
      userRequest: "Hi",
      conversationIntent: CoachConversationIntents.GENERAL_COACHING,
      requestId: "req:freeze",
      generatedAt: FIXED_SESSION_TIMESTAMP,
    });
    expect(Object.isFrozen(result.session)).toBe(true);
    expect(Object.isFrozen(result.session?.evidenceUsed)).toBe(true);
    expect(Object.isFrozen(result.session?.confidence)).toBe(true);
    expect(Object.isFrozen(result.session?.summary)).toBe(true);
  });

  it("registers ExplainableCoachingSessionService in Composition Root", () => {
    const root = createCompositionRoot();
    const service = root.resolve("ExplainableCoachingSessionService");
    expect(service).toBeDefined();
    const built = service.build({
      athleteId: "athlete:1",
      conversationId: "conversation:1",
      sessionId: null,
      userRequest: "Hello coach",
      conversationIntent: CoachConversationIntents.GENERAL_COACHING,
      requestId: "req:cr",
    });
    expect(built.success).toBe(true);
    expect(root.getExplainableCoachingSessionService()).toBe(service);
  });
});
