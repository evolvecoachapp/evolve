import { ToolRuntimeEngine } from "../runtime/ToolRuntimeEngine";
import { ExecutionScheduler } from "../runtime/ExecutionScheduler";
import { ExecutionContextManager } from "../runtime/ExecutionContextManager";
import { ExecutionCoordinator } from "../runtime/ExecutionCoordinator";
import {
  createMockAdapterCatalog,
  createMultiStepActionPlanFixture,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";

describe("tool-runtime runtime", () => {
  it("ToolRuntimeEngine executes workout plan via mocks", async () => {
    const engine = new ToolRuntimeEngine({
      adapters: createMockAdapterCatalog(),
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
    });

    const pkg = await engine.execute(createWorkoutActionPlanFixture(), {
      athleteId: "athlete-1",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(pkg.result?.success).toBe(true);
    expect(pkg.result?.status).toBe(ToolExecutionStatuses.SUCCEEDED);
    expect(pkg.runtime.pipelineId).toBe("pipeline:default");
  });

  it("skips unresolved reminder steps and succeeds resolved ones", async () => {
    const engine = new ToolRuntimeEngine({
      adapters: createMockAdapterCatalog(),
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 2_000,
    });

    const pkg = await engine.execute(createMultiStepActionPlanFixture(), {
      createdAt: FIXED_TIMESTAMP,
    });

    expect(pkg.result).not.toBeNull();
    expect(pkg.result!.completedStepIds.length).toBe(2);
    expect(pkg.result!.skippedStepIds.length).toBe(1);
  });

  it("scheduler and context manager are pure orchestration", () => {
    const manager = new ExecutionContextManager();
    let state = manager.createInitialState({
      id: "state:1",
      updatedAt: FIXED_TIMESTAMP,
    });
    state = manager.withRunning(state, "step:1", FIXED_TIMESTAMP);
    state = manager.withStepCompleted(state, "step:1", FIXED_TIMESTAMP);
    expect(state.completedStepIds).toEqual(["step:1"]);

    const engine = new ToolRuntimeEngine({
      adapters: createMockAdapterCatalog(),
      clock: () => FIXED_TIMESTAMP,
    });
    const plan = engine.buildExecutionPlan(createWorkoutActionPlanFixture(), {
      createdAt: FIXED_TIMESTAMP,
    });
    const scheduled = new ExecutionScheduler().schedule(plan);
    expect(scheduled).toHaveLength(1);

    const coordinator = new ExecutionCoordinator();
    expect(coordinator.id).toBe("runtime:coordinator");
  });
});
