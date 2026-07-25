import { adaptRecovery } from "../application";
import { applyRecoveryAdaptationPolicy } from "../policies/RecoveryAdaptationPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createRecoveryAdaptationInput,
  createTestRecoveryAdaptationEngineService,
} from "../testSupport/fixtures";

describe("recovery-adaptation policies", () => {
  it("allows valid adapted packages", () => {
    const service = createTestRecoveryAdaptationEngineService();
    const result = adaptRecovery({
      service,
      input: createRecoveryAdaptationInput(),
    });
    expect(result.success).toBe(true);
    expect(applyRecoveryAdaptationPolicy(result.adaptation).length).toBe(0);
    expect(applySafetyPolicy(result.package!).length).toBe(0);
  });
});
