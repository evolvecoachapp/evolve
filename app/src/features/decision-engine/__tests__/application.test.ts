import {
  buildDecision,
  describeDecision,
  evaluateDecision,
  resolveDecision,
  validateDecision,
} from "../application";
import { DecisionInputKinds } from "../models/DecisionInput";
import { DecisionOperationKinds } from "../models/DecisionResult";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine application", () => {
  it("exposes public API build → evaluate → resolve → validate → describe", () => {
    const service = createTestDecisionEngineService();

    const built = buildDecision({
      service,
      input: createDecisionInput({ kind: DecisionInputKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(DecisionOperationKinds.BUILD);
    expect(built.recommendationInput).not.toBeNull();
    expect(Object.isFrozen(built.decisions[0])).toBe(true);

    const evaluated = evaluateDecision({
      service,
      input: createDecisionInput({
        id: "request:evaluate",
        kind: DecisionInputKinds.EVALUATE,
      }),
    });
    expect(evaluated.success).toBe(true);
    expect(evaluated.operation).toBe(DecisionOperationKinds.EVALUATE);

    const resolved = resolveDecision({
      service,
      input: createDecisionInput({
        id: "request:resolve",
        kind: DecisionInputKinds.RESOLVE,
      }),
    });
    expect(resolved.success).toBe(true);
    expect(resolved.operation).toBe(DecisionOperationKinds.RESOLVE);

    const validated = validateDecision({
      service,
      input: createDecisionInput({
        id: "request:validate",
        kind: DecisionInputKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(DecisionOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);

    const caps = describeDecision({ service });
    expect(caps.name).toBe("Decision Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildDecision",
        "evaluateDecision",
        "resolveDecision",
        "describeDecision",
        "validateDecision",
      ]),
    );
  });
});
