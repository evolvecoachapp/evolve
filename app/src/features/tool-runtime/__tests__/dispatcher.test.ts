import { ToolDispatcher } from "../dispatch/ToolDispatcher";
import { DefaultDispatchPolicy } from "../dispatch/DispatchPolicy";
import { AdapterResolver } from "../resolver/AdapterResolver";
import { ToolResolver } from "../resolver/ToolResolver";
import { DomainToolIds } from "../../domain-tools/models/DomainToolIds";
import {
  createMockAdapterCatalog,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";

describe("tool-runtime dispatcher", () => {
  it("dispatches accepted steps to mock adapters", async () => {
    const adapters = createMockAdapterCatalog();
    const adapterResolver = new AdapterResolver(adapters);
    const dispatcher = new ToolDispatcher({
      adapterResolver,
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
    });
    const resolver = new ToolResolver(adapters);
    const plan = createWorkoutActionPlanFixture();
    const binding = resolver.resolveStep(plan.steps[0], {
      planId: "texec:disp:1",
    });

    const result = await dispatcher.dispatch(
      {
        requestId: "req:1",
        executionContext: Object.freeze({
          id: "ctx:1",
          planId: "texec:disp:1",
          actionPlanId: plan.id,
          sourceResponseId: plan.sourceResponseId,
          conversationId: null,
          athleteId: "athlete-1",
          requestedAt: FIXED_TIMESTAMP,
          attributes: Object.freeze({}),
          metadata: EMPTY_TOOL_EXECUTION_METADATA,
        }),
        step: binding.executionStep,
        attempt: 0,
        createdAt: FIXED_TIMESTAMP,
      },
      () =>
        Object.freeze({
          id: "tool-req:1",
          call: Object.freeze({
            id: "call:1",
            toolId: binding.toolId!,
            input: Object.freeze({ parameters: Object.freeze({}) }),
            createdAt: FIXED_TIMESTAMP,
          }),
          context: Object.freeze({
            conversationId: null,
            athleteId: "athlete-1",
            streamId: null,
            executionRequestId: "req:1",
            now: FIXED_TIMESTAMP,
            attributes: Object.freeze({}),
          }),
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({}),
            version: null,
          }),
          createdAt: FIXED_TIMESTAMP,
        }),
    );

    expect(result.accepted).toBe(true);
    expect(result.result?.kind).toBe("success");
    expect(adapterResolver.isAvailable(DomainToolIds.WORKOUT_GENERATE)).toBe(
      true,
    );
  });

  it("rejects blocked steps via DispatchPolicy", () => {
    const policy = new DefaultDispatchPolicy();
    const can = policy.canDispatch({
      requestId: "r",
      executionContext: Object.freeze({
        id: "c",
        planId: "p",
        actionPlanId: "a",
        sourceResponseId: "s",
        conversationId: null,
        athleteId: null,
        requestedAt: FIXED_TIMESTAMP,
        attributes: Object.freeze({}),
        metadata: EMPTY_TOOL_EXECUTION_METADATA,
      }),
      step: Object.freeze({
        id: "exec:x",
        planId: "p",
        actionStepId: "x",
        actionType: "reminder",
        label: "x",
        toolId: null,
        adapterId: null,
        order: 0,
        dependsOn: Object.freeze([] as string[]),
        status: "blocked" as const,
        sourceStep: createWorkoutActionPlanFixture().steps[0],
        metadata: EMPTY_TOOL_EXECUTION_METADATA,
      }),
      attempt: 0,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(can).toBe(false);
  });
});
