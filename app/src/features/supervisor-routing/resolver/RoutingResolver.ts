import type {
  CapabilityOwnerRecord,
  CapabilityRegistryPort,
} from "../contracts/CapabilityRegistryPort";
import type { RoutingCapability } from "../models/RoutingCapability";
import type { RoutingDependency } from "../models/RoutingDependency";
import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import {
  RoutingDecisionKinds,
  type RoutingDecision,
} from "../models/RoutingDecision";
import { createCapabilityRoutingPolicy } from "../policies/CapabilityRoutingPolicy";
import { createAgentSelector } from "../selectors/AgentSelector";
import { freezeDecision } from "../utils/FreezeRoutingState";
import { sortIdsDeterministic } from "../utils/sortHelpers";

export interface ResolvedRoutingCapability {
  readonly capability: RoutingCapability;
  readonly owner: CapabilityOwnerRecord | null;
  readonly resolved: boolean;
}

export interface RoutingResolution {
  readonly id: string;
  readonly registryId: string;
  readonly resolved: readonly ResolvedRoutingCapability[];
  readonly owners: readonly CapabilityOwnerRecord[];
  readonly candidateAgentIds: readonly string[];
  readonly dependencies: readonly RoutingDependency[];
  readonly decisions: readonly RoutingDecision[];
  readonly unresolvedCapabilityIds: readonly string[];
  readonly resolvedAt: string;
}

export interface RoutingResolverDeps {
  readonly registry: CapabilityRegistryPort;
  readonly clock?: () => string;
  readonly resolutionIdPrefix?: string;
}

/**
 * Deterministic routing resolver — exact Capability Registry matches only.
 * No ranking. No AI. No heuristics.
 */
export class RoutingResolver {
  private readonly registry: CapabilityRegistryPort;
  private readonly clock: () => string;
  private readonly resolutionIdPrefix: string;
  private readonly capabilityPolicy = createCapabilityRoutingPolicy();
  private readonly agentSelector = createAgentSelector();
  private sequence = 0;

  constructor(deps: RoutingResolverDeps) {
    this.registry = deps.registry;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.resolutionIdPrefix = deps.resolutionIdPrefix ?? "routing-resolution";
  }

  resolve(input: {
    readonly capabilities: readonly RoutingCapability[];
    readonly dependencies?: readonly RoutingDependency[];
  }): RoutingResolution {
    const now = this.clock();
    const resolved: ResolvedRoutingCapability[] = [];
    const owners: CapabilityOwnerRecord[] = [];
    const decisions: RoutingDecision[] = [];
    const unresolved: string[] = [];

    for (const capability of input.capabilities) {
      const owner = this.registry.lookup(capability.capabilityId);
      const assignable = this.capabilityPolicy.isAssignable(owner);
      resolved.push(
        Object.freeze({
          capability,
          owner: assignable ? owner : null,
          resolved: assignable,
        }),
      );

      if (assignable && owner) {
        owners.push(owner);
        decisions.push(
          freezeDecision({
            id: `decision:capability:${capability.capabilityId}`,
            kind: RoutingDecisionKinds.CAPABILITY_RESOLVED,
            subjectId: capability.capabilityId,
            agentId: owner.agentId,
            capabilityId: capability.capabilityId,
            reason: "Exact capability registry match.",
            metadata: EMPTY_ROUTING_METADATA,
            decidedAt: now,
          }),
        );
        decisions.push(
          freezeDecision({
            id: `decision:agent:${capability.capabilityId}`,
            kind: RoutingDecisionKinds.AGENT_SELECTED,
            subjectId: owner.agentId,
            agentId: owner.agentId,
            capabilityId: capability.capabilityId,
            reason: "Owner agent from capability registry.",
            metadata: EMPTY_ROUTING_METADATA,
            decidedAt: now,
          }),
        );
      } else {
        unresolved.push(capability.capabilityId);
      }
    }

    return Object.freeze({
      id: this.nextId(),
      registryId: this.registry.registryId,
      resolved: Object.freeze(resolved),
      owners: Object.freeze(
        [...owners].sort((a, b) =>
          a.capabilityId.localeCompare(b.capabilityId),
        ),
      ),
      candidateAgentIds: this.agentSelector.select({ owners }),
      dependencies: Object.freeze([...(input.dependencies ?? [])]),
      decisions: Object.freeze(decisions),
      unresolvedCapabilityIds: sortIdsDeterministic(unresolved),
      resolvedAt: now,
    });
  }

  private nextId(): string {
    this.sequence += 1;
    return `${this.resolutionIdPrefix}:${this.sequence}`;
  }
}

export function createRoutingResolver(
  deps: RoutingResolverDeps,
): RoutingResolver {
  return new RoutingResolver(deps);
}
