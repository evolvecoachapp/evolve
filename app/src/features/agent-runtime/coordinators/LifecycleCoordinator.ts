import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeState } from "../models/AgentRuntimeState";
import type { AgentRuntimeStatus } from "../models/AgentRuntimeStatus";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import { freezeState } from "../utils/FreezeRuntime";

/**
 * Coordinates runtime lifecycle state transitions. No business logic.
 */
export class LifecycleCoordinator {
  readonly id = "runtime:lifecycle-coordinator";

  createInitial(options: {
    readonly runtimeId: string;
    readonly requestId: string;
    readonly updatedAt: string;
    readonly metadata?: AgentRuntimeMetadata;
  }): AgentRuntimeState {
    return freezeState({
      id: `state:${options.requestId}`,
      runtimeId: options.runtimeId,
      requestId: options.requestId,
      selectedAgentId: null,
      status: AgentRuntimeStatuses.IDLE,
      phase: "idle",
      message: null,
      metadata: options.metadata ?? EMPTY_AGENT_RUNTIME_METADATA,
      updatedAt: options.updatedAt,
    });
  }

  transition(
    state: AgentRuntimeState,
    options: {
      readonly status: AgentRuntimeStatus;
      readonly phase: string;
      readonly selectedAgentId?: string | null;
      readonly message?: string | null;
      readonly updatedAt: string;
      readonly metadata?: AgentRuntimeMetadata;
    },
  ): AgentRuntimeState {
    return freezeState({
      ...state,
      status: options.status,
      phase: options.phase,
      selectedAgentId:
        options.selectedAgentId === undefined
          ? state.selectedAgentId
          : options.selectedAgentId,
      message: options.message === undefined ? state.message : options.message,
      metadata: options.metadata ?? state.metadata,
      updatedAt: options.updatedAt,
    });
  }
}

export function createLifecycleCoordinator(): LifecycleCoordinator {
  return new LifecycleCoordinator();
}
