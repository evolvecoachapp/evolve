import type { RoutingContext } from "./RoutingContext";
import type { RoutingError } from "./RoutingError";
import type { RoutingEvent } from "./RoutingEvent";
import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingPlan } from "./RoutingPlan";
import type { RoutingSnapshot } from "./RoutingSnapshot";
import type { RoutingSummary } from "./RoutingSummary";
import type { RoutingValidation } from "./RoutingValidation";

export const RoutingOperationKinds = {
  BUILD_PLAN: "build_plan",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
} as const;

export type RoutingOperationKind =
  (typeof RoutingOperationKinds)[keyof typeof RoutingOperationKinds];

/**
 * Immutable primary output of Supervisor Routing operations.
 */
export interface RoutingResult {
  readonly id: string;
  readonly operation: RoutingOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly plan: RoutingPlan | null;
  readonly context: RoutingContext | null;
  readonly summary: RoutingSummary | null;
  readonly snapshot: RoutingSnapshot | null;
  readonly description: string | null;
  readonly validation: RoutingValidation;
  readonly error: RoutingError | null;
  readonly events: readonly RoutingEvent[];
  readonly metadata: RoutingMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
