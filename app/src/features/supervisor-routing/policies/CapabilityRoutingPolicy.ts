import type { CapabilityOwnerRecord } from "../contracts/CapabilityRegistryPort";
import {
  RoutingPolicyKinds,
  type RoutingPolicy,
} from "../models/RoutingPolicy";

/**
 * Capability policy — exact registry ownership only.
 */
export class CapabilityRoutingPolicy {
  readonly policy: RoutingPolicy = Object.freeze({
    id: "policy:routing:capability",
    kind: RoutingPolicyKinds.CAPABILITY,
    name: "CapabilityRoutingPolicy",
    description: "Accepts only enabled exact capability registry matches.",
    enabled: true,
  });

  isAssignable(record: CapabilityOwnerRecord | null): boolean {
    return record !== null && record.enabled;
  }
}

export function createCapabilityRoutingPolicy(): CapabilityRoutingPolicy {
  return new CapabilityRoutingPolicy();
}
