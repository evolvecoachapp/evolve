import {
  createAdaptationSnapshot,
  describeAdaptation,
  detectAdaptation,
  evaluateAdaptation,
  validateAdaptation,
} from "../application";
import { AdaptationInputKinds } from "../models/AdaptationInput";
import { AdaptationOperationKinds } from "../models/AdaptationResult";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";

describe("continuous-adaptation application", () => {
  it("exposes public API evaluate → detect → snapshot → validate → describe", () => {
    const service = createTestContinuousAdaptationEngineService();

    const evaluated = evaluateAdaptation({
      service,
      input: createAdaptationInput({ kind: AdaptationInputKinds.EVALUATE }),
    });
    expect(evaluated.success).toBe(true);
    expect(evaluated.operation).toBe(AdaptationOperationKinds.EVALUATE);
    expect(evaluated.decisions.length).toBeGreaterThan(0);
    expect(Object.isFrozen(evaluated.decisions[0])).toBe(true);

    const detected = detectAdaptation({
      service,
      input: createAdaptationInput({ id: "request:detect", kind: AdaptationInputKinds.DETECT }),
    });
    expect(detected.success).toBe(true);
    expect(detected.operation).toBe(AdaptationOperationKinds.DETECT);

    const snap = createAdaptationSnapshot({
      service,
      input: createAdaptationInput({ id: "request:snapshot", kind: AdaptationInputKinds.SNAPSHOT }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();

    const validated = validateAdaptation({
      service,
      input: createAdaptationInput({ id: "request:validate", kind: AdaptationInputKinds.VALIDATE }),
    });
    expect(validated.success).toBe(true);

    const caps = describeAdaptation({ service });
    expect(caps.name).toBe("Continuous Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "evaluateAdaptation",
        "detectAdaptation",
        "describeAdaptation",
        "createAdaptationSnapshot",
        "validateAdaptation",
      ]),
    );
  });
});
