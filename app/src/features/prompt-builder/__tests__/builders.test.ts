import {
  createFullPromptBuilderInputs,
  createPromptBlockFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import { PromptPackageBuilder } from "../builders/PromptPackageBuilder";
import { SystemPromptBuilder } from "../builders/SystemPromptBuilder";
import { UserPromptBuilder } from "../builders/UserPromptBuilder";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";
import { createPromptComposer } from "../composers";

describe("prompt-builder builders", () => {
  it("PromptBlockBuilder returns frozen block", () => {
    const block = new PromptBlockBuilder()
      .withId("prompt-block:test")
      .withType(PromptBlockTypes.SYSTEM)
      .withSection(PromptSections.SYSTEM)
      .withPriority(90)
      .withTitle("System")
      .withStatement("  System   statement  ")
      .build();

    expect(Object.isFrozen(block)).toBe(true);
    expect(block.statement).toBe("System statement");
    expect(block.order).toBe(10);
  });

  it("SystemPromptBuilder and UserPromptBuilder freeze outputs", () => {
    const system = new SystemPromptBuilder()
      .withId("system:1")
      .withStatements(["a", "b"])
      .withBlockIds(["b1"])
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();
    const user = new UserPromptBuilder()
      .withId("user:1")
      .withStatements(["u"])
      .withBlockIds(["b2"])
      .withRequestId("req:1")
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(system)).toBe(true);
    expect(system.role).toBe("system");
    expect(Object.isFrozen(user)).toBe(true);
    expect(user.role).toBe("user");
  });

  it("PromptPackageBuilder builds frozen package via composer inputs", () => {
    const inputs = createFullPromptBuilderInputs();
    const result = createPromptComposer().compose({
      conversationContext: inputs.conversationContext,
      builtAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:builder-test",
    });

    expect(Object.isFrozen(result.promptPackage)).toBe(true);
    expect(result.promptPackage.id).toBe("prompt-package:builder-test");
    expect(result.promptPackage.blocks.length).toBeGreaterThan(0);
  });

  it("createPromptBlockFixture is frozen", () => {
    const block = createPromptBlockFixture();
    expect(Object.isFrozen(block)).toBe(true);
  });

  it("PromptPackageBuilder throws when required fields missing", () => {
    expect(() => new PromptPackageBuilder().build()).toThrow(
      /missing required fields/,
    );
  });
});
