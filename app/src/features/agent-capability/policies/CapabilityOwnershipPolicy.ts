import type { CapabilityPolicy } from "../models/CapabilityPolicy";
import { CapabilityPolicyKinds } from "../models/CapabilityPolicy";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";

/**
 * Ownership policy — each capabilityId maps to exactly one owning agent.
 */
export interface CapabilityOwnershipPolicy {
  readonly policy: CapabilityPolicy;
  assertOwner(
    registrations: readonly CapabilityRegistration[],
    capabilityId: string,
  ): string | null;
  conflictsWith(
    registrations: readonly CapabilityRegistration[],
    candidate: CapabilityRegistration,
  ): boolean;
}

export class DefaultCapabilityOwnershipPolicy
  implements CapabilityOwnershipPolicy
{
  readonly policy: CapabilityPolicy = Object.freeze({
    id: "policy:capability:ownership:default",
    kind: CapabilityPolicyKinds.OWNERSHIP,
    name: "Default Capability Ownership",
    description:
      "Each capabilityId has at most one owning agentId; owner lookup is deterministic.",
    enabled: true,
  });

  assertOwner(
    registrations: readonly CapabilityRegistration[],
    capabilityId: string,
  ): string | null {
    const match = registrations.find(
      (item) => item.capabilityId === capabilityId && item.enabled,
    );
    return match?.agentId ?? null;
  }

  conflictsWith(
    registrations: readonly CapabilityRegistration[],
    candidate: CapabilityRegistration,
  ): boolean {
    return registrations.some(
      (item) =>
        item.capabilityId === candidate.capabilityId &&
        item.agentId !== candidate.agentId,
    );
  }
}

export function createCapabilityOwnershipPolicy(): CapabilityOwnershipPolicy {
  return new DefaultCapabilityOwnershipPolicy();
}
