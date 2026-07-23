import {
  buildPromptPackage,
  buildSystemPrompt,
  buildUserPrompt,
  validatePromptPackage,
} from "../application";
import {
  createFullPromptBuilderInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-builder application API", () => {
  it("buildPromptPackage returns frozen result via public API", () => {
    const inputs = createFullPromptBuilderInputs();
    const result = buildPromptPackage({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:app",
    });

    expect(Object.isFrozen(result.promptPackage)).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(result.promptPackage.id).toBe("prompt-package:app");
    expect(result.validationIssues).toEqual([]);
  });

  it("buildSystemPrompt and buildUserPrompt work without exposing composer", () => {
    const inputs = createFullPromptBuilderInputs();
    const built = buildPromptPackage({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:app-parts",
    });

    const system = buildSystemPrompt(built.promptPackage);
    const user = buildUserPrompt(built.promptPackage);

    expect(system.role).toBe("system");
    expect(system.statements.length).toBeGreaterThan(0);
    expect(user.role).toBe("user");
    expect(user.statements.length).toBeGreaterThan(0);
  });

  it("validatePromptPackage returns empty for valid package", () => {
    const inputs = createFullPromptBuilderInputs();
    const built = buildPromptPackage({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
    });
    expect(validatePromptPackage(built.promptPackage)).toEqual([]);
  });
});
