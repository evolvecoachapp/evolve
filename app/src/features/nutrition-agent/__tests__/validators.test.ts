import {
  validateCalories,
  validateMacros,
  validateMealDistribution,
  validateProtein,
  validateNutritionPlan,
  validateNutritionRequest,
  validateCapabilityCompatibility,
  validateGatewayInvocation,
  validateExecutionContext,
  validateNutritionResult,
} from "../validators";
import { NutritionContextBuilder } from "../builders/NutritionContextBuilder";
import { NutritionPlanBuilder } from "../builders/NutritionPlanBuilder";
import {
  createNutritionRequestFixture,
  createFixedClock,
  createTestAgentService,
} from "../testSupport/fixtures";
import { NutritionIntents } from "../models/NutritionIntent";
import { NutritionCapabilities } from "../models/NutritionCapability";
import { NutritionDomainInvocationStatuses } from "../models/NutritionDomainInvocation";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import { processNutritionRequest } from "../application";

describe("nutrition-agent validators", () => {
  it("validateCalories rejects extreme values", () => {
    expect(validateCalories(100).valid).toBe(false);
    expect(validateCalories(2200).valid).toBe(true);
  });

  it("validateProtein rejects extremes", () => {
    expect(validateProtein(10).valid).toBe(false);
    expect(validateProtein(160).valid).toBe(true);
  });

  it("validateNutritionPlan accepts builder output", () => {
    const clock = createFixedClock();
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock,
    });
    const plan = new NutritionPlanBuilder().buildProposal({ context, clock });
    const validation = validateNutritionPlan(plan);
    expect(validation.valid).toBe(true);
    expect(validateMacros(plan.macroTargets).valid).toBe(true);
    expect(validateMealDistribution(plan.mealDistribution).valid).toBe(true);
  });

  it("validateNutritionRequest requires id and message", () => {
    expect(validateNutritionRequest(null).valid).toBe(false);
    expect(
      validateNutritionRequest(createNutritionRequestFixture()).valid,
    ).toBe(true);
  });

  it("validateCapabilityCompatibility rejects unknown capabilities", () => {
    expect(
      validateCapabilityCompatibility({
        intent: NutritionIntents.HYDRATION,
        capabilities: [NutritionCapabilities.HYDRATION_GUIDANCE],
      }).valid,
    ).toBe(true);
    expect(
      validateCapabilityCompatibility({
        intent: NutritionIntents.HYDRATION,
        capabilities: [NutritionCapabilities.ADJUST_MACROS],
      }).valid,
    ).toBe(false);
  });

  it("validateGatewayInvocation rejects failed invocations", () => {
    expect(
      validateGatewayInvocation(
        Object.freeze([
          Object.freeze({
            id: "ndomain:1",
            capability: NutritionCapabilities.ANALYZE_NUTRITION,
            status: NutritionDomainInvocationStatuses.FAILED,
            summary: "boom",
            resultRef: null,
            attributes: Object.freeze({}),
            invokedAt: "2026-07-23T12:00:00.000Z",
          }),
        ]),
      ).valid,
    ).toBe(false);
  });

  it("validateExecutionContext requires nested context", () => {
    const clock = createFixedClock();
    const context = new NutritionContextBuilder().build({
      request: createNutritionRequestFixture(),
      clock,
    });
    expect(
      validateExecutionContext({
        id: "exec:1",
        context,
        pendingToolIds: Object.freeze([]),
        metadata: EMPTY_NUTRITION_AGENT_METADATA,
        frozenAt: clock(),
      }).valid,
    ).toBe(true);
    expect(validateExecutionContext(null).valid).toBe(false);
  });

  it("validateNutritionResult accepts process output", () => {
    const service = createTestAgentService();
    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(validateNutritionResult(result).valid).toBe(true);
  });
});
