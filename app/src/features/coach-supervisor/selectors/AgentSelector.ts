import type { RoutingResolutionTarget } from "../contracts/RoutingPort";
import { sortByOrderIndex } from "../utils/sortHelpers";

export function selectAgents(
  targets: readonly RoutingResolutionTarget[],
): readonly string[] {
  return Object.freeze(
    sortByOrderIndex(
      targets.map((t) =>
        Object.freeze({
          id: t.agentId,
          orderIndex: t.orderIndex,
        }),
      ),
    ).map((t) => t.id),
  );
}

export function createAgentSelector() {
  return { select: selectAgents };
}
