import type { ToolCapability } from "../models/ToolCapability";
import { TOOL_CAPABILITIES } from "../models/ToolCapability";

/**
 * Rank capabilities by the canonical catalog order.
 */
export function rankCapabilities(
  capabilities: readonly ToolCapability[],
  direction: "asc" | "desc" = "asc",
): readonly ToolCapability[] {
  const order = new Map(
    TOOL_CAPABILITIES.map((capability, index) => [capability, index]),
  );

  const ranked = [...capabilities].sort((left, right) => {
    const leftRank = order.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = order.get(right) ?? Number.MAX_SAFE_INTEGER;
    return direction === "asc" ? leftRank - rightRank : rightRank - leftRank;
  });

  return Object.freeze(ranked);
}
