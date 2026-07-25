import {
  adaptRecovery,
  compareRecovery,
  createRecoverySnapshot,
  describeRecoveryAdaptation,
  validateRecoveryAdaptation,
} from "../application";
import { RecoveryAdaptationInputKinds } from "../models/RecoveryAdaptationInput";
import { RecoveryOperationKinds } from "../models/RecoveryResult";
import {
  createRecoveryAdaptationInput,
  createTestRecoveryAdaptationEngineService,
} from "../testSupport/fixtures";

describe("recovery-adaptation application", () => {
  it("exposes public API adapt → compare → snapshot → validate → describe", () => {
    const service = createTestRecoveryAdaptationEngineService();

    const adapted = adaptRecovery({
      service,
      input: createRecoveryAdaptationInput({ kind: RecoveryAdaptationInputKinds.ADAPT }),
    });
    expect(adapted.success).toBe(true);
    expect(adapted.operation).toBe(RecoveryOperationKinds.ADAPT);
    expect(adapted.adaptation).not.toBeNull();
    expect(adapted.updatedPlan).not.toBeNull();
    expect(adapted.runtimeInput).not.toBeNull();
    expect(Object.isFrozen(adapted)).toBe(true);
    expect(Object.isFrozen(adapted.adaptation!)).toBe(true);
    expect(Object.isFrozen(adapted.updatedPlan!)).toBe(true);

    const compared = compareRecovery({
      service,
      input: createRecoveryAdaptationInput({
        id: "request:compare",
        kind: RecoveryAdaptationInputKinds.COMPARE,
      }),
    });
    expect(compared.success).toBe(true);
    expect(compared.operation).toBe(RecoveryOperationKinds.COMPARE);
    expect(compared.comparison).not.toBeNull();

    const snap = createRecoverySnapshot({
      service,
      input: createRecoveryAdaptationInput({
        id: "request:snapshot",
        kind: RecoveryAdaptationInputKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot!)).toBe(true);

    const validated = validateRecoveryAdaptation({
      service,
      input: createRecoveryAdaptationInput({
        id: "request:validate",
        kind: RecoveryAdaptationInputKinds.VALIDATE,
      }),
    });
    expect(validated.success).toBe(true);

    const caps = describeRecoveryAdaptation({ service });
    expect(caps.name).toBe("Recovery Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "adaptRecovery",
        "compareRecovery",
        "describeRecoveryAdaptation",
        "createRecoverySnapshot",
        "validateRecoveryAdaptation",
      ]),
    );
  });

  it("rejects adaptation without existing plan id", () => {
    const service = createTestRecoveryAdaptationEngineService();
    const result = adaptRecovery({
      service,
      input: createRecoveryAdaptationInput({ planId: "" }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "missing_plan")).toBe(true);
  });
});
