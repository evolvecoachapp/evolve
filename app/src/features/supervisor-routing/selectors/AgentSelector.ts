import type { CapabilityOwnerRecord } from "../contracts/CapabilityRegistryPort";
import type { RoutingConstraint } from "../models/RoutingConstraint";
import { RoutingConstraintKinds } from "../models/RoutingConstraint";

/**
 * Selects candidate agent ids from exact capability owners (no ranking).
 */
export class AgentSelector {
  select(input: {
    readonly owners: readonly CapabilityOwnerRecord[];
    readonly constraints?: readonly RoutingConstraint[];
  }): readonly string[] {
    const forbidden = new Set(
      (input.constraints ?? [])
        .filter((c) => c.kind === RoutingConstraintKinds.FORBID_AGENT)
        .map((c) => String(c.value ?? c.subjectId ?? "")),
    );

    const agents = input.owners
      .filter((owner) => owner.enabled && !forbidden.has(owner.agentId))
      .map((owner) => owner.agentId);

    return Object.freeze([...new Set(agents)].sort((a, b) => a.localeCompare(b)));
  }

  selectOwner(
    owners: readonly CapabilityOwnerRecord[],
    capabilityId: string,
  ): CapabilityOwnerRecord | null {
    return (
      owners.find(
        (owner) => owner.capabilityId === capabilityId && owner.enabled,
      ) ?? null
    );
  }
}

export function createAgentSelector(): AgentSelector {
  return new AgentSelector();
}
