import { validateGoalIntegrity } from "../validators/validateGoalIntegrity";
import { validateDependencies } from "../validators/validateDependencies";
import { validateHistory } from "../validators/validateHistory";
import { validateGoalPackage } from "../validators/validatePackage";
import { validateSnapshot } from "../validators/validateSnapshot";
import { validateTimelineConsistency } from "../validators/validateTimelineConsistency";
import { validateMilestoneConsistency } from "../validators/validateMilestoneConsistency";
import {
  createGoalProgressInput,
  createTestGoalProgressEngineService,
} from "../testSupport/fixtures";

describe("goal-progress validators", () => {
  it("validates package integrity and related structures", () => {
    const service = createTestGoalProgressEngineService();
    const result = service.evaluateGoalProgress(createGoalProgressInput());
    expect(result.package).not.toBeNull();
    const pkg = result.package!;

    expect(validateGoalIntegrity(pkg.decisions)).toHaveLength(0);
    expect(validateMilestoneConsistency(pkg.decisions)).toHaveLength(0);
    expect(validateTimelineConsistency(pkg.timeline)).toHaveLength(0);
    expect(validateHistory(pkg.history)).toHaveLength(0);
    expect(validateSnapshot(pkg.snapshot)).toHaveLength(0);
    expect(validateDependencies(pkg.dependencies)).toHaveLength(0);

    const validation = validateGoalPackage(pkg);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
