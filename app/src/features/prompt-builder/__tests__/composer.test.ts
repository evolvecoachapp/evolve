import { createPromptComposer } from "../composers";
import { MANDATORY_PROMPT_BLOCK_TYPES } from "../models/PromptBlockType";
import {
  createFullPromptBuilderInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-builder composer", () => {
  it("composes a frozen PromptPackage with mandatory blocks", () => {
    const inputs = createFullPromptBuilderInputs();
    const result = createPromptComposer().compose({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:composer",
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.promptPackage)).toBe(true);
    expect(result.promptPackage.assistantPrompt).toBeNull();
    expect(result.systemPrompt.role).toBe("system");
    expect(result.userPrompt.role).toBe("user");

    const types = new Set(result.promptPackage.blocks.map((b) => b.type));
    for (const mandatory of MANDATORY_PROMPT_BLOCK_TYPES) {
      expect(types.has(mandatory)).toBe(true);
    }
  });

  it("is deterministic", () => {
    const inputs = createFullPromptBuilderInputs();
    const a = createPromptComposer().compose({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:det",
    });
    const b = createPromptComposer().compose({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:det",
    });
    expect(a.promptPackage.blocks.map((x) => x.id)).toEqual(
      b.promptPackage.blocks.map((x) => x.id),
    );
    expect(a.statistics.blockCount).toBe(b.statistics.blockCount);
  });

  it("throws when conversation context missing", () => {
    expect(() =>
      createPromptComposer().compose({
        conversationContext: null as never,
      }),
    ).toThrow(/ConversationContext is required/);
  });
});
