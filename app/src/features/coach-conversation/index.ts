/**
 * Intelligent Coach Conversation — product orchestration (Sprint 24.2).
 *
 * Conversation Runtime → Intent Routing → Coaching Session → Supervisor Routing
 * → Coach Supervisor → WorkoutPlan + Athlete/Recommendations context → Response
 *
 * Orchestration only. Reuses existing engines. No new engines.
 */

export * from "./models";
export * from "./routing";
export * from "./builders";
export * from "./store";
export * from "./memory";
export {
  processCoachConversationTurn,
  attachWorkoutPlanToConversation,
} from "./application";
export {
  createCoachConversationService,
  CoachConversationService,
  type CoachConversationServiceDeps,
} from "./services";
export {
  CoachConversationOrchestrator,
  createCoachConversationOrchestrator,
  type CoachConversationOrchestratorDeps,
} from "./orchestrator/CoachConversationOrchestrator";
