import type { CoachConversationRequest } from "../models/CoachConversationRequest";
import type { CoachConversationResult } from "../models/CoachConversationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import {
  createCoachConversationService,
  type CoachConversationService,
  type CoachConversationServiceDeps,
} from "../services/CoachConversationService";

function resolveService(
  service?: CoachConversationService,
  deps?: CoachConversationServiceDeps,
): CoachConversationService {
  if (service) return service;
  if (!deps) {
    throw new Error(
      "CoachConversationService requires an injected service or composition deps.",
    );
  }
  return createCoachConversationService(deps);
}

/**
 * Public API — process one coaching conversation turn through the pipeline.
 */
export function processCoachConversationTurn(options: {
  readonly request: CoachConversationRequest;
  readonly service: CoachConversationService;
}): CoachConversationResult {
  return resolveService(options.service).processTurn(options.request);
}

/**
 * Public API — attach the active WorkoutPlan to the conversation session.
 */
export function attachWorkoutPlanToConversation(options: {
  readonly plan: WorkoutPlan;
  readonly service: CoachConversationService;
}): void {
  resolveService(options.service).attachWorkoutPlan(options.plan);
}

export type { CoachConversationServiceDeps };
