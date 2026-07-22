import { createPromptCompositionEngine } from "../engine";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptEngineError } from "../models/PromptEngineError";
import {
  createFullPromptCompositionInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("PromptCompositionEngine", () => {
  it("composes an immutable PromptPackage with modular blocks", () => {
    const inputs = createFullPromptCompositionInputs();
    const engine = createPromptCompositionEngine();
    const result = engine.compose({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:engine",
    });

    expect(Object.isFrozen(result.promptPackage)).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(result.promptPackage.id).toBe("prompt-package:engine");
    expect(result.promptPackage.conversationContextId).toBe(
      inputs.conversationContext.id,
    );
    expect(result.promptPackage.blocks.length).toBeGreaterThanOrEqual(7);

    const types = result.promptPackage.blocks.map((block) => block.type);
    expect(types).toContain(PromptBlockTypes.SYSTEM);
    expect(types).toContain(PromptBlockTypes.IDENTITY);
    expect(types).toContain(PromptBlockTypes.KNOWLEDGE);
    expect(types).toContain(PromptBlockTypes.CONVERSATION);
    expect(types).toContain(PromptBlockTypes.USER_INPUT);
    expect(types).toContain(PromptBlockTypes.SAFETY);
    expect(types).toContain(PromptBlockTypes.CONSTRAINTS);
  });

  it("throws when ConversationContext is missing", () => {
    const engine = createPromptCompositionEngine();
    expect(() =>
      engine.compose({
        conversationContext: undefined as never,
      }),
    ).toThrow(PromptEngineError);
  });

  it("createSnapshot and summarize work on composed packages", () => {
    const inputs = createFullPromptCompositionInputs();
    const engine = createPromptCompositionEngine();
    const composed = engine.compose({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:engine-parts",
    });

    const snapshot = engine.createSnapshot(composed.promptPackage, {
      snapshotId: "prompt-snapshot:engine",
    });
    expect(snapshot.id).toBe("prompt-snapshot:engine");
    expect(snapshot.promptPackage.blocks.length).toBe(
      composed.promptPackage.blocks.length,
    );

    expect(engine.summarize(composed.promptPackage).blockCount).toBe(
      composed.promptPackage.blocks.length,
    );
    expect(engine.summarize(snapshot).packageId).toBe(snapshot.id);
  });
});
