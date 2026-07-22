import { composePromptPackage } from "../application";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortBlocks } from "../utils/sortBlocks";
import {
  createFullPromptCompositionInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-composition regression", () => {
  it("keeps block order stable across runs", () => {
    const inputs = createFullPromptCompositionInputs();
    const a = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:regression",
    });
    const b = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:regression",
    });

    expect(a.promptPackage.blocks.map((block) => block.id)).toEqual(
      b.promptPackage.blocks.map((block) => block.id),
    );
    expect(sortBlocks(a.promptPackage.blocks).map((block) => block.id)).toEqual(
      a.promptPackage.blocks.map((block) => block.id),
    );
  });

  it("normalizes out-of-range priorities", () => {
    expect(normalizePriority(0)).toBe(1);
    expect(normalizePriority(101)).toBe(100);
    expect(normalizePriority(Number.NaN)).toBe(50);
  });

  it("never emits provider/LLM prompt markers in composition statements", () => {
    const inputs = createFullPromptCompositionInputs();
    const result = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
    });

    const texts = [
      ...result.promptPackage.blocks.map((block) => block.statement),
      ...result.promptPackage.instructions.map((item) => item.statement),
      result.promptPackage.identity.statement,
      result.promptPackage.knowledge.statement,
      result.promptPackage.conversation.statement,
      result.promptPackage.safety.statement,
      result.summary.summaryText,
    ].join(" ");

    expect(texts.toLowerCase()).not.toMatch(
      /\b(openai|anthropic|gemini|ollama|system prompt|you are an? ai)\b/,
    );
  });

  it("reserves future block types without requiring them today", () => {
    const inputs = createFullPromptCompositionInputs();
    const result = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
    });
    const types = new Set(result.promptPackage.blocks.map((b) => b.type));
    expect(types.has("tools")).toBe(false);
    expect(types.has("images")).toBe(false);
    expect(types.has("vision")).toBe(false);
    expect(types.has("audio")).toBe(false);
    expect(types.has("reasoning")).toBe(false);
  });
});
