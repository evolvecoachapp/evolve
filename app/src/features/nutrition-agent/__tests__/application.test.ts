import {
  adjustNutritionPlan,
  buildNutritionPlan,
  describeNutritionCapabilities,
  evaluateNutrition,
  processNutritionRequest,
  validateNutritionPlan,
} from "../application";
import { NutritionCapabilities } from "../models/NutritionCapability";
import { NutritionDomainInvocationStatuses } from "../models/NutritionDomainInvocation";
import type { NutritionDomainResultRef } from "../models/NutritionDomainPayloads";
import {
  createTestAgentService,
  createNutritionRequestFixture,
  FIXED_TIMESTAMP,
  createFixedClock,
} from "../testSupport/fixtures";
import { createNutritionAgentService } from "../services/NutritionAgentService";

describe("nutrition-agent application", () => {
  it("describeNutritionCapabilities returns frozen agent", () => {
    const service = createTestAgentService();
    const agent = describeNutritionCapabilities({ service });
    expect(agent.name).toBe("Nutrition Agent");
    expect(agent.capabilities.length).toBeGreaterThan(0);
    expect(agent.capabilities).toContain("domain_orchestration");
    expect(Object.isFrozen(agent)).toBe(true);
  });

  it("processNutritionRequest returns immutable result with domain selections", () => {
    const service = createTestAgentService();
    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);
    expect(result.decision.plan).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.startedAt).toBe(FIXED_TIMESTAMP);
    expect(result.domainInvocations.length).toBeGreaterThan(0);
    expect(result.domainInvocations[0]?.status).toBe(
      NutritionDomainInvocationStatuses.SELECTED,
    );
    expect(
      result.domainInvocations.some(
        (item) =>
          item.capability === NutritionCapabilities.GENERATE_NUTRITION_PLAN,
      ),
    ).toBe(true);
  });

  it("buildNutritionPlan / evaluate / validate work via public API", () => {
    const service = createTestAgentService();
    const plan = buildNutritionPlan({
      service,
      request: createNutritionRequestFixture(),
    });
    expect(plan.phaseHint).toBeTruthy();
    expect(evaluateNutrition({ service, plan }).valid).toBe(true);
    expect(validateNutritionPlan({ service, plan }).valid).toBe(true);
  });

  it("adjustNutritionPlan invokes AdjustMacros via injected port", async () => {
    const adjustResult: NutritionDomainResultRef = Object.freeze({
      id: "adjust:app:1",
      summary: "Macros adjusted via port",
      attributes: Object.freeze({ proteinG: "170" }),
    });

    const service = createNutritionAgentService({
      clock: createFixedClock(),
      nowMs: () => 1_721_736_000_000,
      agentId: "agent:nutrition:test",
      ports: {
        adjustMacros: async () => adjustResult,
      },
    });

    const result = await adjustNutritionPlan({
      service,
      request: createNutritionRequestFixture(),
      adjustMacrosRequest: Object.freeze({
        id: "adj-req:app:1",
        planId: "plan:1",
        attributes: Object.freeze({}),
      }),
    });

    expect(result.success).toBe(true);
    expect(
      result.domainInvocations.some(
        (item) =>
          item.capability === NutritionCapabilities.ADJUST_MACROS &&
          item.status === NutritionDomainInvocationStatuses.INVOKED,
      ),
    ).toBe(true);
  });
});
