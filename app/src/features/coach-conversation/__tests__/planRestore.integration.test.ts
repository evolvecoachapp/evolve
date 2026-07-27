import {
  CoachConversationIntents,
  CoachConversationStages,
  processCoachConversationTurn,
  routeCoachConversationIntent,
} from "../index";
import {
  createCoachConversationRequest,
  createTestCoachConversationService,
  generateAndAttachPlan,
} from "../testSupport/fixtures";

describe("Plan restore conversation integration", () => {
  it("routes restore intents before modification", () => {
    expect(
      routeCoachConversationIntent("Undo my last workout change"),
    ).toBe(CoachConversationIntents.PLAN_RESTORE);
    expect(
      routeCoachConversationIntent("Restore yesterday's workout"),
    ).toBe(CoachConversationIntents.PLAN_RESTORE);
    expect(
      routeCoachConversationIntent("Bring back my original diet"),
    ).toBe(CoachConversationIntents.PLAN_RESTORE);
    expect(
      routeCoachConversationIntent("I liked the previous version better"),
    ).toBe(CoachConversationIntents.PLAN_RESTORE);
  });

  it("restores previous workout through coach conversation", async () => {
    const service = createTestCoachConversationService();
    const original = await generateAndAttachPlan(service);

    const modified = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:mod-before-restore",
        message: "Reduce the intensity of today's workout",
      }),
    });
    expect(modified.intent).toBe(CoachConversationIntents.WORKOUT_MODIFICATION);
    expect(modified.modification?.success).toBe(true);
    expect(modified.workoutPlan?.id).not.toBe(original.id);

    const restored = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:restore",
        message: "Undo my last workout change",
        sessionId: modified.sessionId,
      }),
    });

    expect(restored.intent).toBe(CoachConversationIntents.PLAN_RESTORE);
    expect(restored.restore?.success).toBe(true);
    expect(restored.restore?.publishedVersion?.versionNumber).toBeGreaterThan(2);
    expect(restored.message).toMatch(/restored|reverted|version/i);
    expect(restored.trace.map((item) => item.stage)).toEqual(
      expect.arrayContaining([
        CoachConversationStages.PLAN_RESTORE,
        CoachConversationStages.RESPONSE,
      ]),
    );
  });
});
