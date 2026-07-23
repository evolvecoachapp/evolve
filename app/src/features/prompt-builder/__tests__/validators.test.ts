import { createPromptComposer } from "../composers";
import {
  validateFormatting,
  validateIntegrity,
  validateMissingBlocks,
  validateOrdering,
  validatePackageCompleteness,
  validateRequiredSections,
} from "../validators";
import { validatePromptPackage } from "../application";
import {
  createFullPromptBuilderInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-builder validators", () => {
  const pkg = createPromptComposer().compose({
    conversationContext: createFullPromptBuilderInputs().conversationContext,
    builtAt: FIXED_TIMESTAMP,
    packageId: "prompt-package:validators",
  }).promptPackage;

  it("passes complete package", () => {
    expect(validatePromptPackage(pkg)).toEqual([]);
    expect(validateMissingBlocks(pkg)).toEqual([]);
    expect(validateRequiredSections(pkg)).toEqual([]);
    expect(validateOrdering(pkg)).toEqual([]);
    expect(validateFormatting(pkg)).toEqual([]);
    expect(validateIntegrity(pkg)).toEqual([]);
    expect(validatePackageCompleteness(pkg)).toEqual([]);
  });

  it("detects missing mandatory blocks", () => {
    const broken = {
      ...pkg,
      blocks: pkg.blocks.filter((b) => b.type !== "system"),
    };
    expect(validateMissingBlocks(broken as typeof pkg)).toContain(
      "missing_mandatory_block:system",
    );
  });

  it("detects order regression", () => {
    const blocks = [...pkg.blocks];
    if (blocks.length >= 2) {
      const swapped = Object.freeze([
        { ...blocks[1], order: 1 },
        { ...blocks[0], order: 1000 },
        ...blocks.slice(2),
      ]);
      const broken = { ...pkg, blocks: swapped };
      expect(validateOrdering(broken as typeof pkg).length).toBeGreaterThan(0);
    }
  });
});
