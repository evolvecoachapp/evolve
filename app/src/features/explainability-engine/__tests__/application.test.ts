import {
  buildExplanation,
  createExplanationSnapshot,
  describeExplanation,
  packageExplanation,
  validateExplanation,
} from "../application";
import { ExplanationInputKinds } from "../models/ExplanationInput";
import { ExplanationOperationKinds } from "../models/ExplanationResult";
import {
  createExplanationInput,
  createTestExplainabilityEngineService,
} from "../testSupport/fixtures";

describe("explainability-engine application", () => {
  it("exposes public API build → validate → snapshot → package → describe", () => {
    const service = createTestExplainabilityEngineService();

    const built = buildExplanation({
      service,
      input: createExplanationInput({ kind: ExplanationInputKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(ExplanationOperationKinds.BUILD);
    expect(built.llmFormatterInput).not.toBeNull();
    expect(Object.isFrozen(built.explanations[0])).toBe(true);

    const validated = validateExplanation({
      service,
      input: createExplanationInput({ id: "request:validate", kind: ExplanationInputKinds.VALIDATE }),
    });
    expect(validated.success).toBe(true);

    const snap = createExplanationSnapshot({
      service,
      input: createExplanationInput({ id: "request:snapshot", kind: ExplanationInputKinds.SNAPSHOT }),
    });
    expect(snap.success).toBe(true);

    const packaged = packageExplanation({
      service,
      input: createExplanationInput({ id: "request:package", kind: ExplanationInputKinds.PACKAGE }),
    });
    expect(packaged.success).toBe(true);

    const caps = describeExplanation({ service });
    expect(caps.name).toBe("Explainability Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildExplanation",
        "validateExplanation",
        "describeExplanation",
        "createExplanationSnapshot",
        "packageExplanation",
      ]),
    );
  });
});
