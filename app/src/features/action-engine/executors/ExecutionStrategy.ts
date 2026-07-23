/**
 * Execution strategy contract (planning-time selection only).
 */
export type ExecutionStrategyKind =
  | "sequential"
  | "priority"
  | "dependency_order"
  | "noop";

export const ExecutionStrategyKinds = Object.freeze({
  SEQUENTIAL: "sequential" as const,
  PRIORITY: "priority" as const,
  DEPENDENCY_ORDER: "dependency_order" as const,
  NOOP: "noop" as const,
});

export interface ExecutionStrategy {
  readonly id: string;
  readonly kind: ExecutionStrategyKind;
  readonly description: string;
}

export const DEFAULT_EXECUTION_STRATEGY: ExecutionStrategy = Object.freeze({
  id: "strategy:dependency_order",
  kind: ExecutionStrategyKinds.DEPENDENCY_ORDER,
  description: "Order steps by dependencies then plan order",
});
