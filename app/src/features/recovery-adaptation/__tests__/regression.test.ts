import {
  adaptRecovery,
  compareRecovery,
  createRecoverySnapshot,
  describeRecoveryAdaptation,
  validateRecoveryAdaptation,
} from "../application";
import * as publicApi from "../index";
import { RecoveryAdaptationInputKinds } from "../models/RecoveryAdaptationInput";
import {
  createRecoveryAdaptationInput,
  createTestRecoveryAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.adaptRecovery).toBe("function");
    expect(typeof publicApi.compareRecovery).toBe("function");
    expect(typeof publicApi.describeRecoveryAdaptation).toBe("function");
    expect(typeof publicApi.createRecoverySnapshot).toBe("function");
    expect(typeof publicApi.validateRecoveryAdaptation).toBe("function");
    expect(publicApi.RecoveryAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createRecoveryAdaptationEngineService).toBe("function");
    expect(publicApi.RecoveryAdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).RecoveryAdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).adaptRecoveryDay).toBeUndefined();
    expect((publicApi as Record<string, unknown>).evaluateSleep).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestRecoveryAdaptationEngineService();
    const input = createRecoveryAdaptationInput({ kind: RecoveryAdaptationInputKinds.ADAPT });
    const a = adaptRecovery({ service, input });
    const b = adaptRecovery({
      service: createTestRecoveryAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.adaptation!.id).toBe(b.adaptation!.id);
    expect(a.adaptation!.decisionKeys).toEqual(b.adaptation!.decisionKeys);
    expect(a.updatedPlan!.id).toBe(b.updatedPlan!.id);
    expect(a.updatedPlan!.modificationIds).toEqual(b.updatedPlan!.modificationIds);
    expect(a.runtimeInput!.id).toBe(b.runtimeInput!.id);

    expect(compareRecovery({ service, input }).success).toBe(true);
    expect(createRecoverySnapshot({ service, input }).success).toBe(true);
    expect(validateRecoveryAdaptation({ service, input }).success).toBe(true);
    expect(describeRecoveryAdaptation({ service }).version).toBe("24.2.0");
  });

  it("requires existing plan — no AI / no generation from scratch", () => {
    const service = createTestRecoveryAdaptationEngineService();
    const missing = adaptRecovery({
      service,
      input: createRecoveryAdaptationInput({ planId: "" }),
    });
    expect(missing.success).toBe(false);

    const caps = describeRecoveryAdaptation({ service });
    expect(caps.boundaries).toEqual(
      expect.arrayContaining([
        "no_ai",
        "no_recovery_generation_from_scratch",
        "adapts_existing_plan_only",
      ]),
    );
  });
});
