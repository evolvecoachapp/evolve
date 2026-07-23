import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingRequest } from "../models/RoutingRequest";
import { sortIdsDeterministic } from "./sortHelpers";

export function collectRequestedCapabilityIds(
  request: RoutingRequest,
): readonly string[] {
  return sortIdsDeterministic(
    request.requiredCapabilities.map((item) => item.capabilityId),
  );
}

export function findCapability(
  capabilities: readonly RoutingCapability[],
  capabilityId: string,
): RoutingCapability | null {
  return (
    capabilities.find((item) => item.capabilityId === capabilityId) ?? null
  );
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export const RoutingHelpers = Object.freeze({
  collectRequestedCapabilityIds,
  findCapability,
  isNonEmptyString,
});
