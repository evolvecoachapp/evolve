import { buildPromptPackage } from "../application";
import { DOMAIN_PROMPT_TEMPLATES } from "../templates";
import { countTokensApprox, normalizeWhitespace } from "../utils";
import {
  createFullPromptBuilderInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-builder regression", () => {
  it("keeps provider-agnostic templates", () => {
    for (const template of DOMAIN_PROMPT_TEMPLATES) {
      expect(template.metadata.attributes.providerAgnostic).toBe(true);
      expect(template.statementPattern.includes("openai")).toBe(false);
      expect(template.statementPattern.includes("anthropic")).toBe(false);
    }
  });

  it("does not generate assistant responses", () => {
    const inputs = createFullPromptBuilderInputs();
    const result = buildPromptPackage({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:regression",
    });
    expect(result.promptPackage.assistantPrompt).toBeNull();
  });

  it("normalizes whitespace and approximates tokens", () => {
    expect(normalizeWhitespace("  a   b  ")).toBe("a b");
    expect(countTokensApprox("abcd")).toBe(1);
    expect(countTokensApprox("abcdefgh")).toBe(2);
  });

  it("preserves block order stability across builds", () => {
    const inputs = createFullPromptBuilderInputs();
    const a = buildPromptPackage({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:order",
    });
    const b = buildPromptPackage({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:order",
    });
    expect(a.promptPackage.blocks.map((x) => x.type)).toEqual(
      b.promptPackage.blocks.map((x) => x.type),
    );
    for (let i = 1; i < a.promptPackage.blocks.length; i += 1) {
      expect(a.promptPackage.blocks[i - 1].order).toBeLessThanOrEqual(
        a.promptPackage.blocks[i].order,
      );
    }
  });
});
