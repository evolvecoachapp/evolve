/**
 * Execution strategy contract — orchestration shape only.
 */
export type ExecutionStrategyKind =
  | "sequential"
  | "parallel"
  | "conditional"
  | "composite"
  | "noop";

export interface ExecutionStrategy {
  readonly id: string;
  readonly kind: ExecutionStrategyKind;
  readonly description: string;
}

export const DEFAULT_EXECUTION_STRATEGY: ExecutionStrategy = Object.freeze({
  id: "strategy:sequential",
  kind: "sequential",
  description: "Execute resolved steps in dependency order, one at a time",
});

export const PARALLEL_EXECUTION_STRATEGY: ExecutionStrategy = Object.freeze({
  id: "strategy:parallel",
  kind: "parallel",
  description: "Contract for parallel execution (no real parallelism required)",
});

export const CONDITIONAL_EXECUTION_STRATEGY: ExecutionStrategy = Object.freeze({
  id: "strategy:conditional",
  kind: "conditional",
  description: "Execute steps when conditions are met",
});

export const COMPOSITE_EXECUTION_STRATEGY: ExecutionStrategy = Object.freeze({
  id: "strategy:composite",
  kind: "composite",
  description: "Compose multiple strategies",
});
