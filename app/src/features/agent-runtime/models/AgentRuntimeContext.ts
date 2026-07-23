import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "./AgentRuntimeRequest";

/**
 * Immutable execution context for a single runtime invocation.
 */
export interface AgentRuntimeContext {
  readonly id: string;
  readonly runtimeId: string;
  readonly request: AgentRuntimeRequest;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: AgentRuntimeMetadata;
  readonly createdAt: string;
}
