import { validateDecisionPackage } from "../validators/validateDecisionPackage";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine validators", () => {
  it("validates built package", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const validation = validateDecisionPackage(built.package!);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
