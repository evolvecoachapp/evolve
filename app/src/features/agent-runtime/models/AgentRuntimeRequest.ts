import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentId } from "../../agent-framework/models/AgentId";
import type { AgentPriority } from "../../agent-framework/models/AgentPriority";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";

/**
 * Immutable runtime request envelope.
 *
 * Selection criteria only — no domain business payloads.
 */
export interface AgentRuntimeRequest {
  readonly id: string;
  readonly agentId: AgentId | null;
  readonly role: AgentRole | null;
  readonly capability: AgentCapabilityKey | null;
  readonly fallbackRole: AgentRole | null;
  readonly fallbackCapability: AgentCapabilityKey | null;
  readonly priority: AgentPriority | null;
  readonly intent: string;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: AgentRuntimeMetadata;
  readonly createdAt: string;
}
