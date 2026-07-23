import type { AgentDescriptor } from "./AgentDescriptor";
import type { AgentFeature } from "./AgentFeature";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentStatistics } from "./AgentStatistics";

/**
 * Immutable agent package — descriptor + features + statistics bag.
 */
export interface AgentPackage {
  readonly id: string;
  readonly descriptor: AgentDescriptor;
  readonly features: readonly AgentFeature[];
  readonly statistics: AgentStatistics;
  readonly metadata: AgentMetadata;
  readonly packagedAt: string;
}
