import type { AgentDescriptor } from "./AgentDescriptor";
import type { AgentHealth } from "./AgentHealth";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentState } from "./AgentState";
import type { AgentStatistics } from "./AgentStatistics";

/**
 * Immutable agent snapshot for describe / observability.
 */
export interface AgentSnapshot {
  readonly id: string;
  readonly descriptor: AgentDescriptor;
  readonly state: AgentState | null;
  readonly health: AgentHealth;
  readonly statistics: AgentStatistics;
  readonly metadata: AgentMetadata;
  readonly capturedAt: string;
}
