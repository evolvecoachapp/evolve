import {
  composePromptPackage,
  createPromptSnapshot,
  summarizePromptPackage,
} from "../application";
import {
  createFullPromptCompositionInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-composition application API", () => {
  it("composePromptPackage returns frozen package via public API", () => {
    const inputs = createFullPromptCompositionInputs();
    const result = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:app",
    });

    expect(Object.isFrozen(result.promptPackage)).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(result.promptPackage.id).toBe("prompt-package:app");
    expect(result.promptPackage.blocks.length).toBeGreaterThan(0);
  });

  it("createPromptSnapshot and summarizePromptPackage work without exposing engine", () => {
    const inputs = createFullPromptCompositionInputs();
    const composed = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:app-parts",
    });

    const snapshot = createPromptSnapshot(composed.promptPackage);
    expect(snapshot.promptPackage.blocks.length).toBe(
      composed.promptPackage.blocks.length,
    );

    const fromSnapshot = summarizePromptPackage(snapshot);
    expect(fromSnapshot.blockCount).toBe(snapshot.promptPackage.blocks.length);

    const fromPackage = summarizePromptPackage(composed.promptPackage);
    expect(fromPackage.summaryText).toContain("prompt block");
  });
});
