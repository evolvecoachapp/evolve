import type { CapabilityPolicy } from "../models/CapabilityPolicy";
import { CapabilityPolicyKinds } from "../models/CapabilityPolicy";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";

/**
 * Uniqueness policy — capabilityId values are unique in the registry.
 */
export interface CapabilityUniquenessPolicy {
  readonly policy: CapabilityPolicy;
  isUnique(
    registrations: readonly CapabilityRegistration[],
    capabilityId: string,
  ): boolean;
  findDuplicates(
    registrations: readonly CapabilityRegistration[],
  ): readonly string[];
}

export class DefaultCapabilityUniquenessPolicy
  implements CapabilityUniquenessPolicy
{
  readonly policy: CapabilityPolicy = Object.freeze({
    id: "policy:capability:uniqueness:default",
    kind: CapabilityPolicyKinds.UNIQUENESS,
    name: "Default Capability Uniqueness",
    description: "capabilityId must be unique across the registry.",
    enabled: true,
  });

  isUnique(
    registrations: readonly CapabilityRegistration[],
    capabilityId: string,
  ): boolean {
    return (
      registrations.filter((item) => item.capabilityId === capabilityId)
        .length <= 1
    );
  }

  findDuplicates(
    registrations: readonly CapabilityRegistration[],
  ): readonly string[] {
    const counts = new Map<string, number>();
    for (const item of registrations) {
      counts.set(item.capabilityId, (counts.get(item.capabilityId) ?? 0) + 1);
    }
    const duplicates: string[] = [];
    for (const [capabilityId, count] of counts) {
      if (count > 1) duplicates.push(capabilityId);
    }
    return Object.freeze(duplicates.sort((a, b) => a.localeCompare(b)));
  }
}

export function createCapabilityUniquenessPolicy(): CapabilityUniquenessPolicy {
  return new DefaultCapabilityUniquenessPolicy();
}
