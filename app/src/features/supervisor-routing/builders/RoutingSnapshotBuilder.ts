import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import type { RoutingContext } from "../models/RoutingContext";
import type { RoutingMetadata } from "../models/RoutingMetadata";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingSnapshot } from "../models/RoutingSnapshot";
import type { RoutingSummary } from "../models/RoutingSummary";
import { freezeSnapshot } from "../utils/FreezeRoutingState";
import { computeRoutingStatistics } from "../utils/StatisticsHelpers";
import { buildRoutingSummary } from "./RoutingSummaryBuilder";
import { sortIdsDeterministic } from "../utils/sortHelpers";

export interface RoutingSnapshotBuilderInput {
  readonly id: string;
  readonly plan: RoutingPlan;
  readonly context: RoutingContext;
  readonly summary?: RoutingSummary;
  readonly metadata?: RoutingMetadata;
  readonly createdAt: string;
  readonly frozenAt?: string;
}

export class RoutingSnapshotBuilder {
  build(input: RoutingSnapshotBuilderInput): RoutingSnapshot {
    const statistics = computeRoutingStatistics(input.plan);
    const summary =
      input.summary ??
      buildRoutingSummary({
        id: `summary:${input.id}`,
        plan: input.plan,
        statistics,
      });

    return freezeSnapshot({
      id: input.id,
      plan: input.plan,
      context: input.context,
      summary,
      statistics,
      agentIds: sortIdsDeterministic([
        ...new Set(input.plan.targets.map((t) => t.agentId)),
      ]),
      capabilityIds: sortIdsDeterministic(
        input.plan.capabilities.map((c) => c.capabilityId),
      ),
      metadata: input.metadata ?? EMPTY_ROUTING_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.frozenAt ?? input.createdAt,
    });
  }
}

export function buildRoutingSnapshotFromInput(
  input: RoutingSnapshotBuilderInput,
): RoutingSnapshot {
  return new RoutingSnapshotBuilder().build(input);
}
