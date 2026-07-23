import { SequentialExecutor } from "../executors/SequentialExecutor";
import { ParallelExecutor } from "../executors/ParallelExecutor";
import { ConditionalExecutor } from "../executors/ConditionalExecutor";
import { CompositeExecutor } from "../executors/CompositeExecutor";
import { DEFAULT_EXECUTION_STRATEGY } from "../executors/ExecutionStrategy";
import { ToolResolver } from "../resolver/ToolResolver";
import { ToolExecutionPlanBuilder } from "../builders/ToolExecutionPlanBuilder";
import {
  createMockAdapterCatalog,
  createWorkoutActionPlanFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("tool-runtime executors", () => {
  function buildPlan() {
    const actionPlan = createWorkoutActionPlanFixture();
    const resolver = new ToolResolver(createMockAdapterCatalog());
    const bindings = resolver.resolvePlan(actionPlan, "texec:ex:1");
    return new ToolExecutionPlanBuilder()
      .withId("texec:ex:1")
      .withActionPlanId(actionPlan.id)
      .withSourceResponseId(actionPlan.sourceResponseId)
      .withSteps(Object.freeze(bindings.map((b) => b.executionStep)))
      .withSourcePlan(actionPlan)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();
  }

  it("SequentialExecutor uses default strategy", () => {
    const executor = new SequentialExecutor();
    const plan = buildPlan();
    expect(executor.canExecute(plan)).toBe(true);
    expect(executor.strategy().id).toBe(DEFAULT_EXECUTION_STRATEGY.id);
  });

  it("ParallelExecutor is contract-only", () => {
    const executor = new ParallelExecutor();
    expect(executor.strategy().kind).toBe("parallel");
    expect(executor.canExecute(buildPlan())).toBe(true);
  });

  it("ConditionalExecutor and CompositeExecutor compose", () => {
    const conditional = new ConditionalExecutor();
    const composite = new CompositeExecutor([
      new SequentialExecutor(),
      conditional,
    ]);
    expect(composite.canExecute(buildPlan())).toBe(true);
    expect(composite.listChildren()).toHaveLength(2);
  });
});
