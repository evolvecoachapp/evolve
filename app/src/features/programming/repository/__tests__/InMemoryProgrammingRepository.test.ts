import { FIXED_PROGRAMMING_TIMESTAMP } from "../../engine/ProgrammingEngine";
import type { ProgrammingResult } from "../../models/ProgrammingResult";
import { createEmptyProgrammingScore } from "../../models/ProgrammingScore";
import { createTestProgrammingContext } from "../../testSupport/fixtures";
import { freezeProgrammingResult } from "../../utils/freezeProgrammingResult";
import { InMemoryProgrammingRepository } from "../InMemoryProgrammingRepository";

function sampleResult(requestId: string): ProgrammingResult {
  return freezeProgrammingResult({
    requestId,
    context: createTestProgrammingContext(),
    prescriptions: Object.freeze([]),
    explanations: Object.freeze([]),
    validationIssues: Object.freeze([]),
    score: createEmptyProgrammingScore(),
    programmedAt: FIXED_PROGRAMMING_TIMESTAMP,
  });
}

describe("InMemoryProgrammingRepository", () => {
  it("saves, loads, lists, and deletes cached results", async () => {
    const repo = new InMemoryProgrammingRepository();
    const saved = await repo.save(sampleResult("programming:a"));
    expect(saved.requestId).toBe("programming:a");
    expect(Object.isFrozen(saved)).toBe(true);

    const loaded = await repo.load("programming:a");
    expect(loaded?.requestId).toBe("programming:a");

    await repo.save(sampleResult("programming:b"));
    const listed = await repo.list();
    expect(listed.map((entry) => entry.requestId)).toEqual([
      "programming:a",
      "programming:b",
    ]);

    expect(await repo.delete("programming:a")).toBe(true);
    expect(await repo.load("programming:a")).toBeNull();

    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });
});
