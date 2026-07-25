import { resolveMerge } from "../resolution/MergeResolver";
import { resolvePriorities } from "../resolution/PriorityResolver";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine resolution", () => {
  it("resolves into immutable coaching decisions", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    expect(built.success).toBe(true);
    expect(built.decisions.length).toBeGreaterThan(0);
    expect(Object.isFrozen(built.decisions[0])).toBe(true);
  });

  it("merges and orders by priority", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const merged = resolveMerge(built.decisions);
    const ordered = resolvePriorities(merged);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]!.priority.ordinal).toBeGreaterThanOrEqual(
        ordered[i - 1]!.priority.ordinal,
      );
    }
  });
});
