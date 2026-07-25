import { adaptRecovery } from "../application";
import { validateRecoveryPackage } from "../validators";
import {
  createRecoveryAdaptationInput,
  createTestRecoveryAdaptationEngineService,
} from "../testSupport/fixtures";

describe("recovery-adaptation validators", () => {
  it("validates successful adapt package", () => {
    const service = createTestRecoveryAdaptationEngineService();
    const result = adaptRecovery({
      service,
      input: createRecoveryAdaptationInput(),
    });
    expect(result.package).not.toBeNull();
    const validation = validateRecoveryPackage(result.package!);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
