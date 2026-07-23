import type { AgentDescriptor } from "../models/AgentDescriptor";
import type { AgentFeature } from "../models/AgentFeature";
import type { AgentMetadata } from "../models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import type { AgentPackage } from "../models/AgentPackage";
import type { AgentStatistics } from "../models/AgentStatistics";
import { EMPTY_AGENT_STATISTICS } from "../models/AgentStatistics";
import { freezePackage } from "../utils/FreezeAgent";

export interface AgentPackageBuilderInput {
  readonly id?: string;
  readonly descriptor: AgentDescriptor;
  readonly features?: readonly AgentFeature[];
  readonly statistics?: AgentStatistics;
  readonly metadata?: AgentMetadata;
  readonly packagedAt?: string;
}

/**
 * Builds an immutable AgentPackage.
 */
export class AgentPackageBuilder {
  build(input: AgentPackageBuilderInput): AgentPackage {
    const features = input.features ?? input.descriptor.features;
    return freezePackage({
      id: input.id ?? `package:${input.descriptor.identity.id}`,
      descriptor: input.descriptor,
      features: Object.freeze([...features]),
      statistics: input.statistics ?? EMPTY_AGENT_STATISTICS,
      metadata: input.metadata ?? EMPTY_AGENT_METADATA,
      packagedAt: input.packagedAt ?? new Date().toISOString(),
    });
  }
}

export function createAgentPackageBuilder(): AgentPackageBuilder {
  return new AgentPackageBuilder();
}

export function buildAgentPackage(
  input: AgentPackageBuilderInput,
): AgentPackage {
  return createAgentPackageBuilder().build(input);
}
