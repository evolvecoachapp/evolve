import type { AgentId } from "../../agent-framework/models/AgentId";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";
import type { AgentRuntimeStatus } from "./AgentRuntimeStatus";

/**
 * Immutable single-agent execution plan (orchestration only).
 */
export interface AgentExecutionPlan {
  readonly id: string;
  readonly requestId: string;
  readonly agentId: AgentId;
  readonly role: AgentRole;
  readonly capability: AgentCapabilityKey | null;
  readonly selectionReason: string;
  readonly fallbackUsed: boolean;
  readonly status: AgentRuntimeStatus;
  readonly metadata: AgentRuntimeMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
