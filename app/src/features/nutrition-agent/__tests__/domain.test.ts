import { NutritionCapabilitySelector } from "../selectors/NutritionCapabilitySelector";
import { NutritionCapabilities } from "../models/NutritionCapability";
import { NutritionIntents } from "../models/NutritionIntent";
import {
  createNutritionDomainGateway,
} from "../orchestrator/NutritionDomainGateway";
import { NutritionDomainInvocationStatuses } from "../models/NutritionDomainInvocation";
import type { NutritionDomainResultRef } from "../models/NutritionDomainPayloads";
import { FIXED_TIMESTAMP, createFixedClock } from "../testSupport/fixtures";

describe("nutrition-agent domain gateway", () => {
  it("selects domain capabilities for plan intent", () => {
    const selected = new NutritionCapabilitySelector().select(
      NutritionIntents.PLAN_NUTRITION,
    );
    expect(selected).toContain(NutritionCapabilities.GENERATE_NUTRITION_PLAN);
    expect(selected).toContain(NutritionCapabilities.MEAL_TIMING);
    expect(selected).toContain(NutritionCapabilities.HYDRATION_GUIDANCE);
  });

  it("selects adjust_macros for adjust intent", () => {
    const selected = new NutritionCapabilitySelector().select(
      NutritionIntents.ADJUST_MACROS,
    );
    expect(selected).toContain(NutritionCapabilities.ADJUST_MACROS);
    expect(selected).toContain(NutritionCapabilities.ANALYZE_NUTRITION);
  });

  it("plans invocations without calling domain ports", () => {
    const gateway = createNutritionDomainGateway({
      clock: createFixedClock(),
    });
    const planned = gateway.planInvocations(
      NutritionIntents.ADJUST_MACROS,
      "ctx:1",
    );
    expect(planned.length).toBeGreaterThan(0);
    expect(planned.every((item) => item.status === "selected")).toBe(true);
    expect(planned[0]?.invokedAt).toBe(FIXED_TIMESTAMP);
  });

  it("invokeAdjustMacros delegates to AdjustMacros port", async () => {
    const adjustResult: NutritionDomainResultRef = Object.freeze({
      id: "adjust:1",
      summary: "Macros adjusted",
      attributes: Object.freeze({ proteinG: "180" }),
    });

    const gateway = createNutritionDomainGateway({
      clock: createFixedClock(),
      ports: {
        adjustMacros: async () => adjustResult,
      },
    });

    const { invocation, result } = await gateway.invokeAdjustMacros(
      {
        id: "adj-req:1",
        planId: "plan:1",
        attributes: Object.freeze({}),
      },
      "ctx:adjust",
    );

    expect(result.id).toBe("adjust:1");
    expect(invocation.status).toBe(NutritionDomainInvocationStatuses.INVOKED);
    expect(invocation.capability).toBe(NutritionCapabilities.ADJUST_MACROS);
    expect(invocation.attributes.proteinG).toBe("180");
  });

  it("invokeSelected skips missing payloads", async () => {
    const gateway = createNutritionDomainGateway({
      clock: createFixedClock(),
    });
    const invocations = await gateway.invokeSelected(
      NutritionIntents.PLAN_NUTRITION,
      "ctx:skip",
      {},
    );
    expect(invocations.length).toBeGreaterThan(0);
    expect(
      invocations.every(
        (item) => item.status === NutritionDomainInvocationStatuses.SKIPPED,
      ),
    ).toBe(true);
  });

  it("invokeSelected invokes when payload and port present", async () => {
    const gateway = createNutritionDomainGateway({
      clock: createFixedClock(),
      ports: {
        generateNutritionPlan: async (request) =>
          Object.freeze({
            id: `gen:${request.id}`,
            summary: "Plan generated",
            attributes: Object.freeze({}),
          }),
      },
    });

    const invocations = await gateway.invokeSelected(
      NutritionIntents.PLAN_NUTRITION,
      "ctx:invoke",
      {
        generatePlanRequest: Object.freeze({
          id: "gen-req:1",
          athleteId: "athlete-1",
          attributes: Object.freeze({}),
        }),
      },
    );

    const generated = invocations.find(
      (item) =>
        item.capability === NutritionCapabilities.GENERATE_NUTRITION_PLAN,
    );
    expect(generated?.status).toBe(NutritionDomainInvocationStatuses.INVOKED);
    expect(generated?.resultRef).toBe("gen:gen-req:1");
  });
});
