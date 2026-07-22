import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import { PromptPackageBuilder } from "../builders/PromptPackageBuilder";
import { PromptSummaryBuilder } from "../builders/PromptSummaryBuilder";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";
import {
  createPromptBlockFixture,
  createPromptPackageFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("prompt-composition builders", () => {
  it("PromptBlockBuilder builds a frozen block", () => {
    const block = new PromptBlockBuilder()
      .withId("block:1")
      .withType(PromptBlockTypes.SYSTEM)
      .withSection(PromptSections.SYSTEM)
      .withPriority(90)
      .withTitle("System")
      .withStatement("System composition fact.")
      .build();

    expect(Object.isFrozen(block)).toBe(true);
    expect(block.order).toBe(10);
  });

  it("PromptSummaryBuilder builds a frozen summary", () => {
    const summary = new PromptSummaryBuilder()
      .withIds({
        packageId: "pkg:1",
        conversationContextId: "conversation:1",
        athleteId: null,
      })
      .withBlockCount(2)
      .withSectionCount(2)
      .withInstructionCount(1)
      .withBlockTypes(["system", "identity"])
      .withTopBlockIds(["a", "b"])
      .withPrimaryIntent("focus")
      .withSummaryText("2 prompt blocks.")
      .build();

    expect(Object.isFrozen(summary)).toBe(true);
    expect(summary.blockCount).toBe(2);
  });

  it("PromptPackageBuilder builds a frozen package", () => {
    const pkg = createPromptPackageFixture({
      id: "prompt-package:builder",
    });
    expect(Object.isFrozen(pkg)).toBe(true);
    expect(pkg.frozenAt).toBe(FIXED_TIMESTAMP);
    expect(pkg.blocks.length).toBe(8);
  });

  it("PromptBlockBuilder rejects incomplete blocks", () => {
    expect(() => new PromptBlockBuilder().build()).toThrow(
      /missing required fields/,
    );
  });

  it("fixture block helper produces typed blocks", () => {
    const block = createPromptBlockFixture({
      type: PromptBlockTypes.KNOWLEDGE,
      section: PromptSections.KNOWLEDGE,
    });
    expect(block.type).toBe(PromptBlockTypes.KNOWLEDGE);
  });
});
