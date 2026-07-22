import {
  validateBlockConsistency,
  validateBlockOrdering,
  validateBlockPriorities,
  validateDuplicateBlocks,
  validateMissingMandatoryBlocks,
  validatePackageConsistency,
  validateSnapshotIntegrity,
} from "../validators";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";
import {
  createPromptBlockFixture,
  createPromptPackageFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { freezeSnapshot } from "../utils/freezePackage";

describe("prompt-composition validators", () => {
  it("detects duplicate block ids and types", () => {
    const a = createPromptBlockFixture({ id: "same" });
    const b = createPromptBlockFixture({ id: "same" });
    expect(validateDuplicateBlocks([a, b])).toContain("duplicate_block_id:same");

    const c = createPromptBlockFixture({
      id: "c",
      type: PromptBlockTypes.SYSTEM,
    });
    const d = createPromptBlockFixture({
      id: "d",
      type: PromptBlockTypes.SYSTEM,
    });
    expect(validateDuplicateBlocks([c, d])).toContain(
      "duplicate_block_type:system",
    );
  });

  it("detects missing mandatory blocks", () => {
    const issues = validateMissingMandatoryBlocks([
      createPromptBlockFixture({ type: PromptBlockTypes.SYSTEM }),
    ]);
    expect(issues).toContain("missing_mandatory_block:identity");
    expect(issues).toContain("missing_mandatory_block:user_input");
  });

  it("validates ordering and priorities", () => {
    const ordered = [
      createPromptBlockFixture({
        id: "a",
        order: 10,
        type: PromptBlockTypes.SYSTEM,
        section: PromptSections.SYSTEM,
      }),
      createPromptBlockFixture({
        id: "b",
        order: 20,
        type: PromptBlockTypes.IDENTITY,
        section: PromptSections.IDENTITY,
        priority: 85,
      }),
    ];
    expect(validateBlockOrdering(ordered)).toEqual([]);

    const regress = [
      createPromptBlockFixture({ id: "a", order: 30 }),
      createPromptBlockFixture({
        id: "b",
        order: 10,
        type: PromptBlockTypes.IDENTITY,
        section: PromptSections.IDENTITY,
      }),
    ];
    expect(validateBlockOrdering(regress)[0]).toMatch(/block_order_regression/);

    const badPriority = createPromptBlockFixture({
      id: "bad",
      priority: 999 as never,
    });
    // bypass builder normalization by freezing manually
    const raw = Object.freeze({ ...badPriority, priority: 999 });
    expect(validateBlockPriorities([raw])).toContain(
      "invalid_block_priority:bad",
    );
  });

  it("validates package consistency and snapshot integrity", () => {
    const pkg = createPromptPackageFixture();
    expect(validatePackageConsistency(pkg)).toEqual([]);
    expect(validateBlockConsistency(pkg.blocks)).toEqual([]);

    const snapshot = freezeSnapshot({
      id: pkg.id,
      promptPackage: pkg,
      summary: pkg.summary,
      frozenAt: FIXED_TIMESTAMP,
    });
    expect(validateSnapshotIntegrity(snapshot)).toEqual([]);
  });
});
