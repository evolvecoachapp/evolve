import type { WorkflowCapability } from "../models/WorkflowCapability";
import { WORKFLOW_CAPABILITIES } from "../models/WorkflowCapability";

/**
 * Rank capabilities by the canonical catalog order.
 */
export function rankWorkflowCapabilities(
  capabilities: readonly WorkflowCapability[],
  direction: "asc" | "desc" = "asc",
): readonly WorkflowCapability[] {
  const order = new Map(
    WORKFLOW_CAPABILITIES.map((capability, index) => [capability, index]),
  );

  const ranked = [...capabilities].sort((left, right) => {
    const leftRank = order.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = order.get(right) ?? Number.MAX_SAFE_INTEGER;
    return direction === "asc" ? leftRank - rightRank : rightRank - leftRank;
  });

  return Object.freeze(ranked);
}
