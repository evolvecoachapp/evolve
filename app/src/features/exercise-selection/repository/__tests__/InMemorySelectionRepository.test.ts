import { FIXED_SELECTION_TIMESTAMP } from "../../engine/ExerciseSelectionEngine";
import type { ExerciseSelectionResult } from "../../models/ExerciseSelectionResult";
import { createEmptySelectionScore } from "../../models/SelectionScore";
import { createTestSelectionContext } from "../../testSupport/fixtures";
import { freezeSelectionResult } from "../../utils/freezeSelectionResult";
import { InMemorySelectionRepository } from "../InMemorySelectionRepository";

function sampleResult(requestId: string): ExerciseSelectionResult {
  return freezeSelectionResult({
    requestId,
    context: createTestSelectionContext(),
    groups: Object.freeze([
      Object.freeze({
        role: "primary" as const,
        candidates: Object.freeze([]),
      }),
    ]),
    candidates: Object.freeze([]),
    rejected: Object.freeze([]),
    explanations: Object.freeze([]),
    validationIssues: Object.freeze([]),
    selectedAt: FIXED_SELECTION_TIMESTAMP,
  });
}

describe("InMemorySelectionRepository", () => {
  it("saves, loads, lists, and deletes cached results", async () => {
    const repo = new InMemorySelectionRepository();
    const saved = await repo.save(sampleResult("selection:a:day"));
    expect(saved.requestId).toBe("selection:a:day");
    expect(Object.isFrozen(saved)).toBe(true);

    const loaded = await repo.load("selection:a:day");
    expect(loaded?.requestId).toBe("selection:a:day");

    await repo.save(sampleResult("selection:b:day"));
    const listed = await repo.list();
    expect(listed.map((entry) => entry.requestId)).toEqual([
      "selection:a:day",
      "selection:b:day",
    ]);

    expect(await repo.delete("selection:a:day")).toBe(true);
    expect(await repo.load("selection:a:day")).toBeNull();

    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });

  it("does not invent score side effects", () => {
    expect(createEmptySelectionScore().category).toBe(0);
  });
});
