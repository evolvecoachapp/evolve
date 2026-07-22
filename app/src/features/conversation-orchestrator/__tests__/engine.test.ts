import { ConversationEngineError } from "../models/ConversationEngineError";
import { createConversationOrchestratorEngine } from "../engine";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-orchestrator engine", () => {
  it("prepare produces frozen ConversationContext from CoachingContext", () => {
    const engine = createConversationOrchestratorEngine();
    const inputs = createFullConversationInputs();

    const result = engine.prepare({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:engine",
    });

    expect(result.context.id).toBe("conversation:engine");
    expect(Object.isFrozen(result.context)).toBe(true);
    expect(result.context.session.coachingContextId).toBe(
      inputs.coachingContext.id,
    );
    expect(result.context.goals.length).toBeGreaterThan(0);
    expect(result.context.request.contextId).toBe("conversation:engine");
    expect(result.context.responsePlaceholder.status).toBe("reserved");
    expect(result.context.responsePlaceholder.content).toBeNull();
  });

  it("throws when CoachingContext is missing", () => {
    const engine = createConversationOrchestratorEngine();
    expect(() =>
      engine.prepare({
        coachingContext: undefined as never,
      }),
    ).toThrow(ConversationEngineError);
  });

  it("records missing optional references as soft validation issues", () => {
    const engine = createConversationOrchestratorEngine();
    const inputs = createFullConversationInputs();

    const result = engine.prepare({
      coachingContext: inputs.coachingContext,
      preparedAt: FIXED_TIMESTAMP,
    });

    expect(result.validationIssues).toEqual(
      expect.arrayContaining([
        "missing_insight_snapshot",
        "missing_recovery_snapshot",
        "missing_athlete_history",
      ]),
    );
    expect(result.context.preparation.missingInformation).toEqual(
      expect.arrayContaining(["missing_insight_snapshot"]),
    );
  });

  it("createSnapshot and summarize round-trip", () => {
    const engine = createConversationOrchestratorEngine();
    const inputs = createFullConversationInputs();
    const prepared = engine.prepare({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:roundtrip",
    });

    const snapshot = engine.createSnapshot(prepared.context);
    expect(snapshot.id).toBe(prepared.context.id);
    expect(engine.summarize(snapshot).contextId).toBe(prepared.context.id);
    expect(engine.summarize(prepared.context).goalCount).toBe(
      prepared.context.goals.length,
    );
  });
});
