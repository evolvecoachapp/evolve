import { validateAdaptationIntegrity } from "../validators/validateAdaptationIntegrity";
import { validateDependencies } from "../validators/validateDependencies";
import { validateHistory } from "../validators/validateHistory";
import { validateAdaptationPackage } from "../validators/validatePackage";
import { validateSnapshot } from "../validators/validateSnapshot";
import { validateTimelineConsistency } from "../validators/validateTimelineConsistency";
import { validateTriggerConsistency } from "../validators/validateTriggerConsistency";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";

describe("continuous-adaptation validators", () => {
  it("validates package integrity and related structures", () => {
    const service = createTestContinuousAdaptationEngineService();
    const result = service.evaluateAdaptation(createAdaptationInput());
    expect(result.package).not.toBeNull();
    const pkg = result.package!;

    expect(validateAdaptationIntegrity(pkg.decisions)).toHaveLength(0);
    expect(validateTriggerConsistency(pkg.decisions)).toHaveLength(0);
    expect(validateTimelineConsistency(pkg.timeline)).toHaveLength(0);
    expect(validateHistory(pkg.history)).toHaveLength(0);
    expect(validateSnapshot(pkg.snapshot)).toHaveLength(0);
    expect(validateDependencies(pkg.dependencies)).toHaveLength(0);

    const validation = validateAdaptationPackage(pkg);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
