import { prepareConversation } from "../../conversation-orchestrator/application";
import { buildPromptPackage } from "../application";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-builder integration", () => {
  it("consumes ConversationContext read-only and produces PromptPackage", () => {
    const upstream = createFullConversationInputs();
    const prepared = prepareConversation({
      ...upstream,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:integration",
    });

    const frozenBefore = Object.isFrozen(prepared.context);
    const result = buildPromptPackage({
      conversationContext: prepared.context,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:integration",
    });

    expect(frozenBefore).toBe(true);
    expect(Object.isFrozen(prepared.context)).toBe(true);
    expect(result.promptPackage.conversationContextId).toBe(
      prepared.context.id,
    );
    expect(result.promptPackage.context.conversationContextId).toBe(
      prepared.context.id,
    );
    expect(result.promptPackage.blocks.length).toBeGreaterThanOrEqual(8);
    expect(result.statistics.approxTokenCount).toBeGreaterThan(0);
  });
});
