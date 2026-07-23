import type { RoutingResolutionTarget } from "../contracts/RoutingPort";
import { sortByOrderIndex } from "../utils/sortHelpers";

export function selectCapabilities(
  targets: readonly RoutingResolutionTarget[],
): readonly string[] {
  return Object.freeze(
    sortByOrderIndex(
      targets.map((t) =>
        Object.freeze({
          id: t.capabilityId,
          orderIndex: t.orderIndex,
        }),
      ),
    ).map((t) => t.id),
  );
}

export function createCapabilitySelector() {
  return { select: selectCapabilities };
}
