import {
  processCoachConversationTurn,
} from "../../coach-conversation/application";
import {
  createCoachConversationRequest,
  createTestCoachConversationService,
  generateAndAttachPlan,
} from "../../coach-conversation/testSupport/fixtures";
import { CoachConversationIntents } from "../../coach-conversation/models/CoachConversationIntent";
import { createGoalProgressEngineService } from "../../goal-progress/services/GoalProgressEngineService";
import { createNutritionAgentService } from "../../nutrition-agent/services/NutritionAgentService";
import { createNutritionRequestFixture } from "../../nutrition-agent/testSupport/fixtures";
import { createRecoveryAgentService } from "../../recovery-agent/services/RecoveryAgentService";
import { createRecoveryRequestFixture } from "../../recovery-agent/testSupport/fixtures";
import { createDecisionEngineService } from "../../decision-engine/services/DecisionEngineService";
import { PlanChangeReasons } from "../../plan-history/models/PlanChangeReason";
import { PlanTypes } from "../../plan-history/models/PlanType";
import { createPlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import { createPlanRestoreService } from "../../plan-restore/services/PlanRestoreService";
import {
  createNutritionPlanFixture,
  createRestoreClock,
  createRestoreRequest,
  createRestoreTarget,
  PlanRestoreTargetKinds,
} from "../../plan-restore/testSupport/fixtures";
import {
  CoachTimelineEventCategories,
  CoachTimelineSummaryKinds,
  createAppendRequest,
  filterTimeline,
  groupTimelineEvents,
  validateTimeline,
  validateTimelineEntryRequest,
} from "../index";
import {
  createTestCoachTimelineService,
  createTimelineClock,
  createTimelineEntryRequest,
  FIXED_TIMELINE_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Coach Timeline integration (Sprint 25.4)", () => {
  it("appends WORKOUT_CREATED on workout attach", async () => {
    const clock = createTimelineClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    const service = createTestCoachConversationService({
      clock: clock.now,
      coachTimeline: timeline,
    });
    const plan = await generateAndAttachPlan(service);
    const entries = timeline.getTimeline(plan.athleteId)?.entries ?? [];
    expect(
      entries.some(
        (entry) =>
          entry.event.category === CoachTimelineEventCategories.WORKOUT_CREATED,
      ),
    ).toBe(true);
    expect(timeline.isImmutable(entries[0]!)).toBe(true);
  });

  it("appends WORKOUT_MODIFIED on adaptive modification", async () => {
    const clock = createTimelineClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    const service = createTestCoachConversationService({
      clock: clock.now,
      coachTimeline: timeline,
    });
    const plan = await generateAndAttachPlan(service);
    clock.advance(1000);
    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:mod-volume",
        athleteId: plan.athleteId,
        message: "Reduce the volume of today's workout",
        createdAt: clock.now(),
      }),
    });
    expect(result.intent).toBe(CoachConversationIntents.WORKOUT_MODIFICATION);
    const modified = timeline
      .getTimeline(plan.athleteId)
      ?.entries.filter(
        (entry) =>
          entry.event.category ===
          CoachTimelineEventCategories.WORKOUT_MODIFIED,
      );
    expect(modified && modified.length > 0).toBe(true);
  });

  it("appends WORKOUT_RESTORED on plan restore", async () => {
    const clock = createTimelineClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    const service = createTestCoachConversationService({
      clock: clock.now,
      coachTimeline: timeline,
    });
    const plan = await generateAndAttachPlan(service);
    clock.advance(1000);
    processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:mod-before-restore",
        athleteId: plan.athleteId,
        message: "Reduce the intensity of today's workout",
        createdAt: clock.now(),
      }),
    });
    clock.advance(1000);
    const restore = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:restore",
        athleteId: plan.athleteId,
        message: "Undo my last workout change",
        createdAt: clock.now(),
      }),
    });
    expect(restore.intent).toBe(CoachConversationIntents.PLAN_RESTORE);
    expect(restore.restore?.success).toBe(true);
    const restored = timeline
      .getTimeline(plan.athleteId)
      ?.entries.filter(
        (entry) =>
          entry.event.category ===
          CoachTimelineEventCategories.WORKOUT_RESTORED,
      );
    expect(restored && restored.length > 0).toBe(true);
  });

  it("appends NUTRITION_CREATED / NUTRITION_MODIFIED from nutrition agent", async () => {
    const timeline = createTestCoachTimelineService();
    const nutrition = createNutritionAgentService({
      agentId: "agent:nutrition:test",
      coachTimeline: timeline,
      clock: () => FIXED_TIMELINE_TIMESTAMP,
      nowMs: () => Date.parse(FIXED_TIMELINE_TIMESTAMP),
    });
    const created = nutrition.processNutritionRequest({
      request: createNutritionRequestFixture({
        athleteId: "athlete:1",
        conversationId: "conversation:1",
      }),
    });
    expect(created.success).toBe(true);
    const adjusted = await nutrition.adjustNutritionPlan({
      request: createNutritionRequestFixture({
        id: "nreq:adjust:1",
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        message: "Adjust my diet macros for a cut",
      }),
      adjustMacrosRequest: Object.freeze({
        id: "adjust:1",
        planId: created.decision.plan?.id ?? null,
        attributes: Object.freeze({ proteinG: "170" }),
      }),
    });
    expect(adjusted.success).toBe(true);
    const entries = timeline.getTimeline("athlete:1")?.entries ?? [];
    expect(
      entries.some(
        (entry) =>
          entry.event.category ===
          CoachTimelineEventCategories.NUTRITION_CREATED,
      ),
    ).toBe(true);
    expect(
      entries.some(
        (entry) =>
          entry.event.category ===
          CoachTimelineEventCategories.NUTRITION_MODIFIED,
      ),
    ).toBe(true);
  });

  it("appends GOAL_PROGRESS / GOAL_CHANGED entries", () => {
    const timeline = createTestCoachTimelineService();
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:goal:1",
        category: CoachTimelineEventCategories.GOAL_PROGRESS,
        affectedDomain: "goal",
        summary: "Goal progress updated",
        explanation: "Tracked goal progress",
      }),
    );
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:goal:2",
        category: CoachTimelineEventCategories.GOAL_CHANGED,
        affectedDomain: "goal",
        summary: "Goal changed",
        explanation: "Primary goal updated",
        createdAt: FIXED_TIMELINE_TIMESTAMP,
      }),
    );
    const goals = createGoalProgressEngineService({ coachTimeline: timeline });
    expect(goals).toBeDefined();
    expect(
      timeline
        .getTimeline("athlete:1")
        ?.entries.some(
          (entry) =>
            entry.event.category ===
            CoachTimelineEventCategories.GOAL_PROGRESS,
        ),
    ).toBe(true);
  });

  it("appends RECOVERY_ADJUSTMENT from recovery agent", () => {
    const timeline = createTestCoachTimelineService();
    const recovery = createRecoveryAgentService({
      agentId: "agent:recovery:test",
      coachTimeline: timeline,
      clock: () => FIXED_TIMELINE_TIMESTAMP,
      nowMs: () => Date.parse(FIXED_TIMELINE_TIMESTAMP),
    });
    const result = recovery.processRecoveryRequest({
      request: createRecoveryRequestFixture({
        athleteId: "athlete:1",
        conversationId: "conversation:1",
      }),
    });
    expect(result.success).toBe(true);
    const entries = timeline.getTimeline("athlete:1")?.entries ?? [];
    expect(
      entries.some(
        (entry) =>
          entry.event.category ===
          CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
      ),
    ).toBe(true);
  });

  it("supports COACH_DECISION logging", () => {
    const timeline = createTestCoachTimelineService();
    const decisions = createDecisionEngineService({
      coachTimeline: timeline,
    });
    expect(decisions).toBeDefined();
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:decision:1",
        category: CoachTimelineEventCategories.COACH_DECISION,
        summary: "Coach decision recorded",
      }),
    );
    expect(
      timeline
        .getTimeline("athlete:1")
        ?.entries.some(
          (entry) =>
            entry.event.category === CoachTimelineEventCategories.COACH_DECISION,
        ),
    ).toBe(true);
  });

  it("keeps timeline ordering chronological", () => {
    const clock = createTimelineClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:a",
        createdAt: clock.now(),
        summary: "First",
      }),
    );
    clock.advance(5000);
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:b",
        createdAt: clock.now(),
        summary: "Second",
      }),
    );
    clock.advance(5000);
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:c",
        createdAt: clock.now(),
        summary: "Third",
      }),
    );
    const entries = timeline.getTimeline("athlete:1")!.entries;
    expect(entries.map((entry) => entry.id)).toEqual(["tl:a", "tl:b", "tl:c"]);
    expect(validateTimeline(timeline.getTimeline("athlete:1")).valid).toBe(
      true,
    );
  });

  it("filters timeline by category and search text", () => {
    const timeline = createTestCoachTimelineService();
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:vol",
        category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
        affectedDomain: "workout",
        summary: "Lowered volume",
        explanation: "Reduced weekly volume due to fatigue",
        createdAt: FIXED_TIMELINE_TIMESTAMP,
      }),
    );
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:diet",
        category: CoachTimelineEventCategories.NUTRITION_MODIFIED,
        affectedDomain: "nutrition",
        summary: "Diet adjusted for cut",
        explanation: "Calories reduced for cut phase",
        createdAt: FIXED_TIMELINE_TIMESTAMP,
      }),
    );
    const filtered = filterTimeline(timeline.getTimeline("athlete:1")!.entries, {
      categories: [CoachTimelineEventCategories.WORKOUT_MODIFIED],
      searchText: "volume",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe("tl:vol");
  });

  it("builds deterministic timeline summaries", () => {
    const timeline = createTestCoachTimelineService();
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:mod",
        category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
        affectedDomain: "workout",
        summary: "Workout modified",
      }),
    );
    timeline.appendEntry(
      createTimelineEntryRequest({
        id: "tl:rec",
        category: CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
        affectedDomain: "recovery",
        summary: "Recovery adjusted",
      }),
    );
    const mods = timeline.buildSummary(
      "athlete:1",
      CoachTimelineSummaryKinds.RECENT_WORKOUT_MODIFICATIONS,
    );
    expect(mods.title).toBe("Recent workout modifications");
    expect(mods.entryIds).toContain("tl:mod");
    const recovery = timeline.buildSummary(
      "athlete:1",
      CoachTimelineSummaryKinds.RECENT_RECOVERY_DECISIONS,
    );
    expect(recovery.title).toBe("Recent recovery decisions");
    expect(recovery.entryIds).toContain("tl:rec");
    const latest = timeline.buildSummary(
      "athlete:1",
      CoachTimelineSummaryKinds.LATEST_COACH_DECISIONS,
    );
    expect(latest.title).toBe("Latest coach decisions");
  });

  it("answers conversation timeline queries from journal entries only", async () => {
    const clock = createTimelineClock();
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    const service = createTestCoachConversationService({
      clock: clock.now,
      coachTimeline: timeline,
    });
    const plan = await generateAndAttachPlan(service);
    clock.advance(1000);
    processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:mod-for-query",
        athleteId: plan.athleteId,
        message: "Reduce the volume of today's workout",
        createdAt: clock.now(),
      }),
    });
    clock.advance(1000);
    const answer = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "req:why-volume",
        athleteId: plan.athleteId,
        message: "Why did you lower my volume?",
        createdAt: clock.now(),
      }),
    });
    expect(answer.intent).toBe(CoachConversationIntents.TIMELINE_QUERY);
    expect(answer.message).toContain("Coach Timeline");
    expect(answer.message.toLowerCase()).not.toContain("i think maybe");
    expect(answer.context?.timelineResult?.entries.length).toBeGreaterThan(0);
  });

  it("handles unknown event categories via validation", () => {
    const invalid = validateTimelineEntryRequest(
      createAppendRequest({
        id: "tl:bad",
        athleteId: "athlete:1",
        category: "NOT_A_REAL_CATEGORY" as never,
        summary: "x",
        explanation: "y",
        reason: "r",
        impact: "i",
        expectedOutcome: "o",
        affectedDomain: "unknown",
        createdAt: FIXED_TIMELINE_TIMESTAMP,
      }),
    );
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.some((error) => /Unknown event category/.test(error))).toBe(
      true,
    );
  });

  it("rejects validation failures on append", () => {
    const timeline = createTestCoachTimelineService();
    expect(() =>
      timeline.appendEntry(
        createAppendRequest({
          id: "",
          athleteId: "athlete:1",
          category: CoachTimelineEventCategories.UNKNOWN,
          summary: "",
          explanation: "",
          reason: "",
          impact: "",
          expectedOutcome: "",
          affectedDomain: "unknown",
          createdAt: FIXED_TIMELINE_TIMESTAMP,
        }),
      ),
    ).toThrow();
  });

  it("keeps timeline entries immutable after append", () => {
    const timeline = createTestCoachTimelineService();
    const entry = timeline.appendEntry(
      createTimelineEntryRequest({ id: "tl:immutable" }),
    );
    expect(timeline.isImmutable(entry)).toBe(true);
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(entry.decisionReason)).toBe(true);
    const grouped = groupTimelineEvents([entry]);
    expect(grouped.get(entry.event.category)?.[0]?.id).toBe(entry.id);
  });

  it("appends NUTRITION_RESTORED through plan restore", () => {
    const clock = createRestoreClock();
    const history = createPlanHistoryService({ clock: clock.now });
    const timeline = createTestCoachTimelineService({ clock: clock.now });
    const restore = createPlanRestoreService({
      planHistory: history,
      coachTimeline: timeline,
      clock: clock.now,
    });
    const plan = createNutritionPlanFixture({ id: "nutrition-plan:restore" });
    history.publishVersion(
      Object.freeze({
        id: "publish:nut:1",
        lineageId: "lineage:nutrition:1",
        planType: PlanTypes.NUTRITION,
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        sessionId: "session:1",
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial nutrition",
        workoutPlan: null,
        nutritionPlan: plan,
        createdAt: clock.now(),
      }),
    );
    clock.advance(1000);
    history.publishVersion(
      Object.freeze({
        id: "publish:nut:2",
        lineageId: "lineage:nutrition:1",
        planType: PlanTypes.NUTRITION,
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        sessionId: "session:1",
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Modified nutrition",
        workoutPlan: null,
        nutritionPlan: createNutritionPlanFixture({
          id: "nutrition-plan:restore:v2",
        }),
        createdAt: clock.now(),
      }),
    );
    clock.advance(1000);
    const result = restore.restore(
      createRestoreRequest({
        id: "restore-req:nut",
        message: "Restore previous nutrition",
        createdAt: clock.now(),
        target: createRestoreTarget({
          kind: PlanRestoreTargetKinds.PREVIOUS_VERSION,
          lineageId: "lineage:nutrition:1",
          planType: PlanTypes.NUTRITION,
        }),
      }),
    );
    expect(result.success).toBe(true);
    expect(
      timeline
        .getTimeline("athlete:1")
        ?.entries.some(
          (entry) =>
            entry.event.category ===
            CoachTimelineEventCategories.NUTRITION_RESTORED,
        ),
    ).toBe(true);
  });
});
