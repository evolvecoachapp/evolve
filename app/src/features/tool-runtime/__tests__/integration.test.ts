import { executeActionPlan, buildExecutionPlan } from "../application";
import {
  createMockAdapterCatalog,
  createMockDomainToolAdapter,
  createMultiStepActionPlanFixture,
  createTestRuntimeHarness,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { DomainToolIds } from "../../domain-tools/models/DomainToolIds";
import { createToolRuntimeService } from "../services/ToolRuntimeService";

describe("tool-runtime integration", () => {
  it("ActionPlan → Tool Runtime → mock adapters → ToolExecutionResult", async () => {
    const { service } = createTestRuntimeHarness();
    const actionPlan = createMultiStepActionPlanFixture();

    const executionPlan = buildExecutionPlan({
      service,
      actionPlan,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(executionPlan.steps).toHaveLength(3);

    const pkg = await executeActionPlan({
      service,
      actionPlan,
      createdAt: FIXED_TIMESTAMP,
      athleteId: "athlete-1",
    });

    expect(pkg.request).not.toBeNull();
    expect(pkg.result).not.toBeNull();
    expect(pkg.result!.results.length).toBe(3);
    expect(
      pkg.result!.results.filter((r) => r.kind === "success"),
    ).toHaveLength(2);
    expect(
      pkg.result!.results.filter((r) => r.kind === "skipped"),
    ).toHaveLength(1);
  });

  it("never calls real domain services — only mock adapters", async () => {
    const calls: string[] = [];
    const adapters = Object.freeze([
      createMockDomainToolAdapter({
        id: "adapter.workout.mock",
        domain: "workout",
        toolIds: [DomainToolIds.WORKOUT_GENERATE],
        executeImpl: async (request) => {
          calls.push(request.call.toolId);
          return Object.freeze({
            executionId: "e1",
            requestId: request.id,
            callId: request.call.id,
            toolId: request.call.toolId,
            output: Object.freeze({ data: Object.freeze({ ok: true }) }),
            error: null,
            status: "succeeded" as const,
            durationMs: 1,
            completedAt: FIXED_TIMESTAMP,
          });
        },
      }),
      ...createMockAdapterCatalog().filter(
        (a) => a.id() !== "adapter.workout.mock",
      ),
    ]);

    const service = createToolRuntimeService({
      adapters,
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
    });

    await executeActionPlan({
      service,
      actionPlan: createWorkoutActionPlanFixture(),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(calls).toEqual([DomainToolIds.WORKOUT_GENERATE]);
  });
});
