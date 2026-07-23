import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityMatch } from "../models/CapabilityMatch";
import type { AgentCapability } from "../models/AgentCapability";

/**
 * Deterministic registration sort: capabilityId asc, then agentId asc.
 */
export function sortRegistrationsDeterministic(
  registrations: readonly CapabilityRegistration[],
): readonly CapabilityRegistration[] {
  return Object.freeze(
    [...registrations].sort((a, b) => {
      const byCapability = a.capabilityId.localeCompare(b.capabilityId);
      if (byCapability !== 0) return byCapability;
      return a.agentId.localeCompare(b.agentId);
    }),
  );
}

/**
 * Deterministic match sort: capabilityId asc, then agentId asc.
 */
export function sortMatchesDeterministic(
  matches: readonly CapabilityMatch[],
): readonly CapabilityMatch[] {
  return Object.freeze(
    [...matches].sort((a, b) => {
      const byCapability = a.capabilityId.localeCompare(b.capabilityId);
      if (byCapability !== 0) return byCapability;
      return a.agentId.localeCompare(b.agentId);
    }),
  );
}

/**
 * Deterministic capability sort: capabilityId asc, then agentId asc.
 */
export function sortCapabilitiesDeterministic(
  capabilities: readonly AgentCapability[],
): readonly AgentCapability[] {
  return Object.freeze(
    [...capabilities].sort((a, b) => {
      const byCapability = a.capabilityId.localeCompare(b.capabilityId);
      if (byCapability !== 0) return byCapability;
      return a.agentId.localeCompare(b.agentId);
    }),
  );
}

/**
 * Deterministic string id sort.
 */
export function sortIdsDeterministic(
  ids: readonly string[],
): readonly string[] {
  return Object.freeze([...ids].sort((a, b) => a.localeCompare(b)));
}
