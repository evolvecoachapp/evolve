import type { AgentStatus } from "../models/AgentStatus";
import { AgentStatuses, isTerminalStatus } from "../models/AgentStatus";

/**
 * Allowed framework lifecycle transitions.
 * Lifecycle only — no execution logic.
 */
const TRANSITIONS: Readonly<Record<AgentStatus, readonly AgentStatus[]>> =
  Object.freeze({
    unregistered: Object.freeze([
      AgentStatuses.REGISTERED,
      AgentStatuses.FAILED,
    ]),
    registered: Object.freeze([
      AgentStatuses.INITIALIZING,
      AgentStatuses.READY,
      AgentStatuses.SHUTTING_DOWN,
      AgentStatuses.FAILED,
    ]),
    initializing: Object.freeze([
      AgentStatuses.READY,
      AgentStatuses.FAILED,
      AgentStatuses.SHUTTING_DOWN,
    ]),
    ready: Object.freeze([
      AgentStatuses.BUSY,
      AgentStatuses.DEGRADED,
      AgentStatuses.SHUTTING_DOWN,
      AgentStatuses.FAILED,
    ]),
    busy: Object.freeze([
      AgentStatuses.READY,
      AgentStatuses.DEGRADED,
      AgentStatuses.FAILED,
      AgentStatuses.SHUTTING_DOWN,
    ]),
    degraded: Object.freeze([
      AgentStatuses.READY,
      AgentStatuses.BUSY,
      AgentStatuses.FAILED,
      AgentStatuses.SHUTTING_DOWN,
    ]),
    shutting_down: Object.freeze([
      AgentStatuses.SHUTDOWN,
      AgentStatuses.FAILED,
    ]),
    shutdown: Object.freeze([] as AgentStatus[]),
    failed: Object.freeze([
      AgentStatuses.INITIALIZING,
      AgentStatuses.SHUTTING_DOWN,
      AgentStatuses.SHUTDOWN,
    ]),
  });

export class AgentStateMachine {
  canTransition(from: AgentStatus, to: AgentStatus): boolean {
    if (from === to) {
      return true;
    }
    return TRANSITIONS[from].includes(to);
  }

  assertTransition(from: AgentStatus, to: AgentStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`invalid_lifecycle_transition:${from}->${to}`);
    }
  }

  allowedTargets(from: AgentStatus): readonly AgentStatus[] {
    return TRANSITIONS[from];
  }

  isTerminal(status: AgentStatus): boolean {
    return isTerminalStatus(status);
  }
}

export function createAgentStateMachine(): AgentStateMachine {
  return new AgentStateMachine();
}
