import type { AgentExecutionContext } from "./AgentExecutionContext";
import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentResponse } from "./AgentResponse";
import type { AgentStatistics } from "./AgentStatistics";

/**
 * Immutable execution result shell (no domain execution).
 */
export interface AgentExecutionResult {
  readonly id: string;
  readonly agentId: AgentId;
  readonly executionContext: AgentExecutionContext;
  readonly response: AgentResponse | null;
  readonly success: boolean;
  readonly message: string;
  readonly statistics: AgentStatistics;
  readonly metadata: AgentMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
