import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationResult } from "../models/CollaborationResult";
import type { ExecutionResult } from "../models/ExecutionResult";
import type { CollaborationParticipantHandler } from "../models/CollaborationParticipantHandler";
import {
  CollaborationEngine,
  createCollaborationEngine,
  type CollaborationEngineDeps,
} from "../execution/CollaborationEngine";

export interface AgentCollaborationServiceDeps extends CollaborationEngineDeps {
  readonly engine?: CollaborationEngine;
}

/**
 * Agent Collaboration Service — deterministic orchestration facade.
 *
 * No networking. No providers. No persistence. No AI. No prompts.
 */
export class AgentCollaborationService {
  private readonly engine: CollaborationEngine;

  constructor(deps: AgentCollaborationServiceDeps = {}) {
    this.engine = deps.engine ?? createCollaborationEngine(deps);
  }

  getEngine(): CollaborationEngine {
    return this.engine;
  }

  registerHandler(
    agentId: string,
    handler: CollaborationParticipantHandler,
  ): void {
    this.engine.registerHandler(agentId, handler);
  }

  createCollaborationPlan(request: CollaborationRequest): CollaborationResult {
    return this.engine.createPlan(request);
  }

  async dispatchCollaboration(input?: {
    readonly plan?: CollaborationPlan;
    readonly request?: CollaborationRequest;
  }): Promise<CollaborationResult> {
    return this.engine.dispatch(input);
  }

  async executeCollaboration(
    request: CollaborationRequest,
  ): Promise<CollaborationResult> {
    return this.engine.execute(request);
  }

  aggregateResults(input?: {
    readonly plan?: CollaborationPlan;
    readonly results?: readonly ExecutionResult[];
  }): CollaborationResult {
    return this.engine.aggregateResults(input);
  }

  buildCollaborationSnapshot(options: {
    readonly snapshotId?: string;
  } = {}): CollaborationResult {
    return this.engine.buildSnapshot(options);
  }
}

export function createAgentCollaborationService(
  deps: AgentCollaborationServiceDeps = {},
): AgentCollaborationService {
  return new AgentCollaborationService(deps);
}
