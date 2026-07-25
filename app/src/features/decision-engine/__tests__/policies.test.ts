import { applyDecisionPolicy } from "../policies/DecisionPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine policies", () => {
  it("applies deterministic policies", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    expect(applyDecisionPolicy(built.package!)).toEqual([]);
    expect(Array.isArray(applySafetyPolicy(built.package!))).toBe(true);
  });
});
