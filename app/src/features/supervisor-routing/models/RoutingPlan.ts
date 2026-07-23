import type { RoutingCapability } from "./RoutingCapability";
import type { RoutingConstraint } from "./RoutingConstraint";
import type { RoutingDecision } from "./RoutingDecision";
import type { RoutingDependency } from "./RoutingDependency";
import type { RoutingExecutionOrder } from "./RoutingExecutionOrder";
import type { RoutingGraph } from "./RoutingGraph";
import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingPhase } from "./RoutingPhase";
import type { RoutingPolicy } from "./RoutingPolicy";
import type { RoutingPriority } from "./RoutingPriority";
import type { RoutingReasoning } from "./RoutingReasoning";
import type { RoutingStep } from "./RoutingStep";
import type { RoutingTarget } from "./RoutingTarget";

/**
 * Immutable multi-agent routing plan.
 *
 * Routing NEVER executes — this is a frozen schedule only.
 */
export interface RoutingPlan {
  readonly id: string;
  readonly requestId: string;
  readonly sessionId: string;
  readonly intent: string;
  readonly capabilities: readonly RoutingCapability[];
  readonly targets: readonly RoutingTarget[];
  readonly dependencies: readonly RoutingDependency[];
  readonly priorities: readonly RoutingPriority[];
  readonly phases: readonly RoutingPhase[];
  readonly steps: readonly RoutingStep[];
  readonly executionOrder: RoutingExecutionOrder;
  readonly graph: RoutingGraph;
  readonly decisions: readonly RoutingDecision[];
  readonly constraints: readonly RoutingConstraint[];
  readonly policies: readonly RoutingPolicy[];
  readonly reasoning: RoutingReasoning;
  readonly metadata: RoutingMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
