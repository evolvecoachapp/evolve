import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingStatistics } from "../models/RoutingStatistics";
import type { RoutingSummary } from "../models/RoutingSummary";
import { formatRoutingDescription } from "../utils/FormattingHelpers";
import { freezeSummary } from "../utils/FreezeRoutingState";
import { computeRoutingStatistics } from "../utils/StatisticsHelpers";
import { sortIdsDeterministic } from "../utils/sortHelpers";

export interface RoutingSummaryBuilderInput {
  readonly id: string;
  readonly plan: RoutingPlan;
  readonly statistics?: RoutingStatistics;
  readonly unresolvedCapabilityCount?: number;
}

export class RoutingSummaryBuilder {
  build(input: RoutingSummaryBuilderInput): RoutingSummary {
    const statistics =
      input.statistics ??
      computeRoutingStatistics(
        input.plan,
        input.unresolvedCapabilityCount ?? 0,
      );

    return freezeSummary({
      id: input.id,
      planId: input.plan.id,
      intent: input.plan.intent,
      agentIds: sortIdsDeterministic([
        ...new Set(input.plan.targets.map((t) => t.agentId)),
      ]),
      capabilityIds: sortIdsDeterministic(
        input.plan.capabilities.map((c) => c.capabilityId),
      ),
      phaseKinds: Object.freeze([
        ...new Set(input.plan.phases.map((p) => p.kind)),
      ]),
      description: formatRoutingDescription(input.plan),
      statistics,
    });
  }
}

export function buildRoutingSummary(
  input: RoutingSummaryBuilderInput,
): RoutingSummary {
  return new RoutingSummaryBuilder().build(input);
}
