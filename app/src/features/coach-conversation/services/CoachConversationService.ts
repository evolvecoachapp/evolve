import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { CoachConversationRequest } from "../models/CoachConversationRequest";
import type { CoachConversationResult } from "../models/CoachConversationResult";
import {
  CoachConversationOrchestrator,
  createCoachConversationOrchestrator,
  type CoachConversationOrchestratorDeps,
} from "../orchestrator/CoachConversationOrchestrator";
import type { ActiveWorkoutPlanStore } from "../store/ActiveWorkoutPlanStore";
import type { ConversationMemoryService } from "../../conversation-memory/services/ConversationMemoryService";

export type CoachConversationServiceDeps = CoachConversationOrchestratorDeps;

/**
 * Service facade for Intelligent Coach Conversation (Sprint 24.2 product).
 * Orchestration only — no engine business logic.
 */
export class CoachConversationService {
  private readonly orchestrator: CoachConversationOrchestrator;

  constructor(deps: CoachConversationServiceDeps) {
    this.orchestrator = createCoachConversationOrchestrator(deps);
  }

  processTurn(request: CoachConversationRequest): CoachConversationResult {
    return this.orchestrator.processTurn(request);
  }

  attachWorkoutPlan(plan: WorkoutPlan): void {
    this.orchestrator.attachWorkoutPlan(plan);
  }

  getActiveWorkoutPlan(options: {
    readonly conversationId: string | null;
    readonly sessionId: string | null;
  }): WorkoutPlan | null {
    return this.orchestrator.getPlanStore().resolve(options);
  }

  getPlanStore(): ActiveWorkoutPlanStore {
    return this.orchestrator.getPlanStore();
  }

  getMemory(): ConversationMemoryService {
    return this.orchestrator.getMemory();
  }
}

export function createCoachConversationService(
  deps: CoachConversationServiceDeps,
): CoachConversationService {
  return new CoachConversationService(deps);
}
