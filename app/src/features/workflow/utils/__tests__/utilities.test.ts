import { InMemoryWorkflowRegistry } from "../../registry/InMemoryWorkflowRegistry";
import { GenerateWorkoutWorkflow } from "../../workflows/placeholders/GenerateWorkoutWorkflow";
import { calculateWorkflowComplexity } from "../calculateWorkflowComplexity";
import { deepCloneWorkflowRequest } from "../deepCloneWorkflowRequest";
import { freezeWorkflowRegistry } from "../freezeWorkflowRegistry";
import { isWorkflowRequest } from "../isWorkflowRequest";
import { rankWorkflowCapabilities } from "../rankWorkflowCapabilities";
import {
  createWorkflowRequest,
  createWorkflowStep,
} from "../../testSupport/fixtures";

describe("workflow utilities", () => {
  it("freezeWorkflowRegistry blocks further registration", () => {
    const registry = new InMemoryWorkflowRegistry();
    registry.register(new GenerateWorkoutWorkflow());
    freezeWorkflowRegistry(registry);
    expect(registry.isFrozen()).toBe(true);
  });

  it("rankWorkflowCapabilities orders by catalog sequence", () => {
    expect(
      rankWorkflowCapabilities([
        "build_nutrition_overview",
        "generate_workout",
        "plan_deload",
      ]),
    ).toEqual([
      "generate_workout",
      "plan_deload",
      "build_nutrition_overview",
    ]);
  });

  it("deepCloneWorkflowRequest freezes a copy", () => {
    const request = createWorkflowRequest({
      arguments: Object.freeze([
        Object.freeze({ name: "limit", value: 3 }),
      ]),
    });
    const cloned = deepCloneWorkflowRequest(request);

    expect(cloned).toEqual({
      ...request,
      arguments: Object.freeze([
        Object.freeze({ name: "limit", value: 3 }),
      ]),
    });
    expect(cloned).not.toBe(request);
    expect(Object.isFrozen(cloned)).toBe(true);
  });

  it("calculateWorkflowComplexity counts steps and hooks", () => {
    expect(
      calculateWorkflowComplexity([
        createWorkflowStep({ maxRetries: 2, conditional: true }),
        createWorkflowStep({
          id: "step-2",
          order: 1,
          earlyExitOnSuccess: true,
        }),
      ]),
    ).toBe(6);
  });

  it("isWorkflowRequest distinguishes requests from tools and responses", () => {
    expect(isWorkflowRequest(createWorkflowRequest())).toBe(true);
    expect(
      isWorkflowRequest({
        id: "t1",
        toolName: "get_athlete_profile",
        arguments: [],
        requestedAt: "2026-07-22T12:00:00.000Z",
      }),
    ).toBe(false);
    expect(
      isWorkflowRequest({
        message: { role: "assistant" },
        finishReason: "stop",
      }),
    ).toBe(false);
  });
});
