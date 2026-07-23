import type { RuntimeExecutor } from "../executors/ExecutionPolicy";
import { SequentialExecutor } from "../executors/SequentialExecutor";
import { ParallelExecutor } from "../executors/ParallelExecutor";
import { ConditionalExecutor } from "../executors/ConditionalExecutor";
import { CompositeExecutor } from "../executors/CompositeExecutor";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";

/**
 * Deterministic executor selection.
 */
export class ExecutorSelector {
  readonly id = "selector:executor:default";

  constructor(
    private readonly sequential = new SequentialExecutor(),
    private readonly parallel = new ParallelExecutor(),
    private readonly conditional = new ConditionalExecutor(),
    private readonly composite = new CompositeExecutor([
      new SequentialExecutor(),
    ]),
  ) {}

  select(plan: ToolExecutionPlan, preferredId?: string): RuntimeExecutor {
    const catalog = this.list();
    if (preferredId) {
      const match = catalog.find((e) => e.id === preferredId);
      if (match && match.canExecute(plan)) return match;
    }
    return this.sequential.canExecute(plan)
      ? this.sequential
      : this.composite;
  }

  list(): readonly RuntimeExecutor[] {
    return Object.freeze([
      this.sequential,
      this.parallel,
      this.conditional,
      this.composite,
    ]);
  }
}
