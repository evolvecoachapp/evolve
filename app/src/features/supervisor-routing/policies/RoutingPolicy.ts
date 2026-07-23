import {
  RoutingPolicyKinds,
  type RoutingPolicy,
} from "../models/RoutingPolicy";
import type { RoutingRequest } from "../models/RoutingRequest";
import { isNonEmptyString } from "../utils/RoutingHelpers";

/**
 * Core routing policy — request shape rules (deterministic).
 */
export class CoreRoutingPolicy {
  readonly policy: RoutingPolicy = Object.freeze({
    id: "policy:routing:core",
    kind: RoutingPolicyKinds.ROUTING,
    name: "CoreRoutingPolicy",
    description: "Requires non-empty request id, coach agent, and intent.",
    enabled: true,
  });

  isSatisfied(request: RoutingRequest): boolean {
    return (
      isNonEmptyString(request.id) &&
      isNonEmptyString(request.coachAgentId) &&
      isNonEmptyString(request.intent)
    );
  }
}

export function createCoreRoutingPolicy(): CoreRoutingPolicy {
  return new CoreRoutingPolicy();
}
