import {
  createConversationSnapshot,
  prepareConversation,
  summarizeConversation,
} from "../application";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-orchestrator application API", () => {
  it("prepareConversation returns frozen context via public API", () => {
    const inputs = createFullConversationInputs();
    const result = prepareConversation({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:app",
    });

    expect(Object.isFrozen(result.context)).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(result.context.id).toBe("conversation:app");
    expect(result.context.goals.length).toBeGreaterThan(0);
  });

  it("createConversationSnapshot and summarizeConversation work without exposing engine", () => {
    const inputs = createFullConversationInputs();
    const prepared = prepareConversation({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:app-parts",
    });

    const snapshot = createConversationSnapshot(prepared.context);
    expect(snapshot.context.goals.length).toBe(prepared.context.goals.length);

    const fromSnapshot = summarizeConversation(snapshot);
    expect(fromSnapshot.goalCount).toBe(snapshot.context.goals.length);

    const fromContext = summarizeConversation(prepared.context);
    expect(fromContext.summaryText).toContain("conversation goal");
  });
});
