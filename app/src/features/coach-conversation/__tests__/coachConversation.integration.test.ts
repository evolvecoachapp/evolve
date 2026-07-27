import { CoachConversationStages } from "../models";
import { processCoachConversationTurn } from "../application";
import {
  createCoachConversationRequest,
  createTestCoachConversationService,
  generateAndAttachPlan,
} from "../testSupport/fixtures";
import { MemoryCategories } from "../../conversation-memory/models/MemoryCategory";

describe("Coach conversation integration", () => {
  it("runs conversation + workout explanation against an attached WorkoutPlan", async () => {
    const service = createTestCoachConversationService();
    const plan = await generateAndAttachPlan(service);

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:explain",
        message: "Explain today's workout",
      }),
    });

    expect(result.success).toBe(true);
    expect(result.workoutPlan?.id).toBe(plan.id);
    expect(result.response?.referencesWorkoutPlan).toBe(true);
    expect(result.message).toContain(plan.summary.title);
    expect(result.trace.map((item) => item.stage)).toEqual(
      expect.arrayContaining([
        CoachConversationStages.INTENT_ROUTING,
        CoachConversationStages.COACHING_SESSION,
        CoachConversationStages.SUPERVISOR_ROUTING,
        CoachConversationStages.COACH_SUPERVISOR,
        CoachConversationStages.CONTEXT_ASSEMBLY,
        CoachConversationStages.RESPONSE,
        CoachConversationStages.MEMORY,
      ]),
    );
  });

  it("records conversation memory for coaching turns", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:memory",
        message: "Summarize my workout",
      }),
    });

    expect(result.memory?.success).toBe(true);
    const snapshot = service.getMemory().buildMemorySnapshot({
      snapshotId: "snap:integration",
    });
    expect(snapshot.success).toBe(true);
    expect(
      snapshot.snapshot?.entries.some(
        (entry) =>
          entry.category === MemoryCategories.CONTEXT &&
          entry.key === "active_workout_plan",
      ),
    ).toBe(true);
    expect(
      snapshot.snapshot?.entries.some(
        (entry) => entry.key === "last_coach_reply",
      ),
    ).toBe(true);
  });

  it("produces coach explanations for progression, recovery, and recommendations", async () => {
    const service = createTestCoachConversationService();
    const plan = await generateAndAttachPlan(service);

    const progression = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:progression",
        message: "Explain the progression plan",
        sessionId: null,
      }),
    });
    const recovery = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:recovery",
        message: "Explain the recovery decision",
        sessionId: progression.sessionId,
      }),
    });
    const recommendation = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:recommendation",
        message: "Explain your recommendations",
        sessionId: recovery.sessionId,
      }),
    });

    expect(progression.success).toBe(true);
    expect(progression.message.toLowerCase()).toContain("progression");
    expect(recovery.success).toBe(true);
    expect(recovery.message).toBeTruthy();
    expect(recommendation.success).toBe(true);
    expect(recommendation.workoutPlan?.id).toBe(plan.id);
  });

  it("routes intents and answers follow-up questions with session continuity", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);

    const first = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:first",
        message: "Explain today's workout",
      }),
    });
    expect(first.success).toBe(true);
    expect(first.sessionId).toBeTruthy();

    const followUp = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:follow-up",
        message: "Why this exercise selection?",
        sessionId: first.sessionId,
      }),
    });

    expect(followUp.success).toBe(true);
    expect(followUp.sessionId).toBe(first.sessionId);
    expect(followUp.intent).toBe("exercise_explanation");
    expect(followUp.workoutPlan?.id).toBe(first.workoutPlan?.id);
    expect(followUp.message).toContain("Primary session exercises");
  });

  it("keeps unknown intent fallback usable without a plan", () => {
    const service = createTestCoachConversationService();
    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:unknown",
        message: "zzzz unrelated",
      }),
    });

    expect(result.success).toBe(true);
    expect(result.intent).toBe("unknown");
    expect(result.message).toContain("Generate a workout first");
  });
});
