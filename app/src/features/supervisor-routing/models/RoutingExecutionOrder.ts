import type { RoutingStep } from "./RoutingStep";

/**
 * Immutable deterministic execution order (plan schedule only).
 */
export interface RoutingExecutionOrder {
  readonly id: string;
  readonly planId: string;
  readonly stepIds: readonly string[];
  readonly steps: readonly RoutingStep[];
  readonly batchCount: number;
}
