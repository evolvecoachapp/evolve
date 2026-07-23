import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingSummary } from "../models/RoutingSummary";

export function formatRoutingDescription(plan: RoutingPlan): string {
  const agents = [...new Set(plan.targets.map((t) => t.agentId))]
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
  const capabilities = plan.capabilities
    .map((c) => c.capabilityId)
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
  return `Routing plan ${plan.id} for "${plan.intent}" → agents [${agents || "none"}] capabilities [${capabilities || "none"}] steps=${plan.steps.length}`;
}

export function formatSummaryLine(summary: RoutingSummary): string {
  return `${summary.description} | agents=${summary.agentIds.length} capabilities=${summary.capabilityIds.length}`;
}

export const FormattingHelpers = Object.freeze({
  formatRoutingDescription,
  formatSummaryLine,
});
