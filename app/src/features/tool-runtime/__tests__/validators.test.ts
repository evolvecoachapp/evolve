import { validateExecutionPlan } from "../validators/validateExecutionPlan";
import { validateExecutionContext } from "../validators/validateExecutionContext";
import { validateDependencies } from "../validators/validateDependencies";
import { AdapterResolver } from "../resolver/AdapterResolver";
import { ToolResolver } from "../resolver/ToolResolver";
import { ToolExecutionPlanBuilder } from "../builders/ToolExecutionPlanBuilder";
import {
  createMockAdapterCatalog,
  createMultiStepActionPlanFixture,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";

describe("tool-runtime validators", () => {
  it("validates a resolved workout plan", () => {
    const adapters = createMockAdapterCatalog();
    const actionPlan = createWorkoutActionPlanFixture();
    const resolver = new ToolResolver(adapters);
    const bindings = resolver.resolvePlan(actionPlan, "texec:v:1");
    const plan = new ToolExecutionPlanBuilder()
      .withId("texec:v:1")
      .withActionPlanId(actionPlan.id)
      .withSourceResponseId(actionPlan.sourceResponseId)
      .withSteps(Object.freeze(bindings.map((b) => b.executionStep)))
      .withSourcePlan(actionPlan)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const validation = validateExecutionPlan(
      plan,
      new AdapterResolver(adapters),
    );
    expect(validation.valid).toBe(true);
  });

  it("flags unresolved reminder tools when checking adapters", () => {
    const adapters = createMockAdapterCatalog();
    const actionPlan = createMultiStepActionPlanFixture();
    const resolver = new ToolResolver(adapters);
    const bindings = resolver.resolvePlan(actionPlan, "texec:v:2");
    const plan = new ToolExecutionPlanBuilder()
      .withId("texec:v:2")
      .withActionPlanId(actionPlan.id)
      .withSourceResponseId(actionPlan.sourceResponseId)
      .withSteps(Object.freeze(bindings.map((b) => b.executionStep)))
      .withSourcePlan(actionPlan)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const validation = validateExecutionPlan(
      plan,
      new AdapterResolver(adapters),
    );
    expect(validation.valid).toBe(false);
    expect(
      validation.issues.some((i) => i.code === "tool_unresolved"),
    ).toBe(true);
  });

  it("validateExecutionContext requires ids", () => {
    const issues = validateExecutionContext(
      Object.freeze({
        id: "",
        planId: "",
        actionPlanId: "",
        sourceResponseId: "s",
        conversationId: null,
        athleteId: null,
        requestedAt: "",
        attributes: Object.freeze({}),
        metadata: EMPTY_TOOL_EXECUTION_METADATA,
      }),
    );
    expect(issues.length).toBeGreaterThan(0);
  });

  it("validateDependencies detects cycles", () => {
    const actionPlan = createWorkoutActionPlanFixture();
    const step = Object.freeze({
      id: "exec:a",
      planId: "texec:cycle",
      actionStepId: "a",
      actionType: "workout",
      label: "a",
      toolId: "domain.workout.generate",
      adapterId: "adapter.workout.mock",
      order: 0,
      dependsOn: Object.freeze(["exec:a"]),
      status: "ready" as const,
      sourceStep: actionPlan.steps[0],
      metadata: EMPTY_TOOL_EXECUTION_METADATA,
    });
    const issues = validateDependencies(
      Object.freeze({
        id: "texec:cycle",
        actionPlanId: actionPlan.id,
        sourceResponseId: actionPlan.sourceResponseId,
        steps: Object.freeze([step]),
        orderedStepIds: Object.freeze(["exec:a"]),
        status: "ready" as const,
        metadata: EMPTY_TOOL_EXECUTION_METADATA,
        sourcePlan: actionPlan,
        createdAt: FIXED_TIMESTAMP,
        frozenAt: FIXED_TIMESTAMP,
      }),
    );
    expect(issues.some((i) => i.code === "circular_dependency")).toBe(true);
  });
});
