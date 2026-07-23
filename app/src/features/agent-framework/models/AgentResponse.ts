import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";

/**
 * Immutable framework agent response envelope (no domain payloads).
 */
export interface AgentResponse {
  readonly id: string;
  readonly requestId: string;
  readonly agentId: AgentId;
  readonly success: boolean;
  readonly message: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: AgentMetadata;
  readonly completedAt: string;
}
