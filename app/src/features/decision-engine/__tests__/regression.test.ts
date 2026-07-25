import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine regression", () => {
  it("is deterministic for identical inputs", () => {
    const a = createTestDecisionEngineService();
    const b = createTestDecisionEngineService();
    const input = createDecisionInput();
    const left = a.buildDecision(input);
    const right = b.buildDecision(input);
    expect(left.decisions.map((d) => d.id)).toEqual(
      right.decisions.map((d) => d.id),
    );
    expect(left.decisions.map((d) => d.score.total)).toEqual(
      right.decisions.map((d) => d.score.total),
    );
    expect(left.package!.statistics).toEqual(right.package!.statistics);
  });

  it("never attaches provider or network fields", () => {
    const service = createTestDecisionEngineService();
    const result = service.buildDecision(createDecisionInput());
    const serialized = JSON.stringify(result.package);
    expect(serialized).not.toMatch(/openai|anthropic|http:\/\/|https:\/\//i);
  });
});
