import { FIXED_PROGRESSION_TIMESTAMP } from "../../engine/ProgressionEngine";
import type { ProgressionPlan } from "../../models/ProgressionPlan";
import { createEmptyProgressionScore } from "../../models/ProgressionScore";
import { createTestProgressionContext } from "../../testSupport/fixtures";
import { freezeProgressionPlan } from "../../utils/freezeProgressionPlan";
import { InMemoryProgressionRepository } from "../InMemoryProgressionRepository";

async function samplePlan(requestId: string): Promise<ProgressionPlan> {
  return freezeProgressionPlan({
    requestId,
    context: await createTestProgressionContext(),
    exerciseProgressions: Object.freeze([]),
    timeline: Object.freeze([]),
    explanations: Object.freeze([]),
    validationIssues: Object.freeze([]),
    score: createEmptyProgressionScore(),
    progressedAt: FIXED_PROGRESSION_TIMESTAMP,
  });
}

describe("InMemoryProgressionRepository", () => {
  it("saves, loads, lists, and deletes cached plans", async () => {
    const repo = new InMemoryProgressionRepository();
    const saved = await repo.save(await samplePlan("progression:a"));
    expect(saved.requestId).toBe("progression:a");
    expect(Object.isFrozen(saved)).toBe(true);

    const loaded = await repo.load("progression:a");
    expect(loaded?.requestId).toBe("progression:a");

    await repo.save(await samplePlan("progression:b"));
    const listed = await repo.list();
    expect(listed.map((entry) => entry.requestId)).toEqual([
      "progression:a",
      "progression:b",
    ]);

    expect(await repo.delete("progression:a")).toBe(true);
    expect(await repo.load("progression:a")).toBeNull();

    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });
});
