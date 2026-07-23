import type { RoutingDecision } from "./RoutingDecision";
import type { RoutingMetadata } from "./RoutingMetadata";

/**
 * Immutable deterministic reasoning trail (rules applied — not AI).
 */
export interface RoutingReasoning {
  readonly id: string;
  readonly summary: string;
  readonly decisions: readonly RoutingDecision[];
  readonly rulesApplied: readonly string[];
  readonly metadata: RoutingMetadata;
}
