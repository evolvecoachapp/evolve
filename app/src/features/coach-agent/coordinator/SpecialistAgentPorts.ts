import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { NutritionAgentResult } from "../../nutrition-agent/models/NutritionAgentResult";
import type { NutritionRequest } from "../../nutrition-agent/models/NutritionRequest";
import { processNutritionRequest } from "../../nutrition-agent/application";
import type { RecoveryAgentResult } from "../../recovery-agent/models/RecoveryAgentResult";
import type { RecoveryRequest } from "../../recovery-agent/models/RecoveryRequest";
import { processRecoveryRequest } from "../../recovery-agent/application";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { WorkoutAgentResult } from "../../workout-agent/models/WorkoutAgentResult";
import type { WorkoutRequest } from "../../workout-agent/models/WorkoutRequest";
import { processWorkoutRequest } from "../../workout-agent/application";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../../nutrition-agent/models/NutritionMetadata";
import { EMPTY_RECOVERY_AGENT_METADATA } from "../../recovery-agent/models/RecoveryMetadata";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../../workout-agent/models/WorkoutAgentMetadata";
import type { CoachRequest } from "../models/CoachRequest";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";

export interface SpecialistSharedContext {
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
}

/**
 * Injectable ports for specialist agents.
 * Defaults call public application APIs — agents are not modified.
 */
export interface SpecialistAgentPorts {
  readonly processWorkout?: (
    input: {
      readonly request: WorkoutRequest;
    } & SpecialistSharedContext,
  ) => WorkoutAgentResult;
  readonly processRecovery?: (
    input: {
      readonly request: RecoveryRequest;
    } & SpecialistSharedContext,
  ) => RecoveryAgentResult;
  readonly processNutrition?: (
    input: {
      readonly request: NutritionRequest;
    } & SpecialistSharedContext,
  ) => NutritionAgentResult;
}

export function createDefaultSpecialistPorts(): SpecialistAgentPorts {
  return Object.freeze({
    processWorkout: (
      input: { readonly request: WorkoutRequest } & SpecialistSharedContext,
    ) => processWorkoutRequest(input),
    processRecovery: (
      input: { readonly request: RecoveryRequest } & SpecialistSharedContext,
    ) => processRecoveryRequest(input),
    processNutrition: (
      input: { readonly request: NutritionRequest } & SpecialistSharedContext,
    ) => processNutritionRequest(input),
  });
}

/**
 * Derive a minimal specialist request from the coach request when none embedded.
 * Pass-through shaping only — no domain logic.
 */
export function deriveWorkoutRequest(request: CoachRequest): WorkoutRequest {
  if (request.workoutRequest) {
    return request.workoutRequest;
  }
  return Object.freeze({
    id: `wreq:from:${request.id}`,
    athleteId: request.athleteId,
    conversationId: request.conversationId,
    message: request.message,
    intentHint: null,
    objectiveHint: null,
    daysPerWeek: null,
    experienceLevel: null,
    constraints: Object.freeze([...request.constraints]),
    metadata: EMPTY_WORKOUT_AGENT_METADATA,
    createdAt: request.createdAt,
  });
}

export function deriveRecoveryRequest(request: CoachRequest): RecoveryRequest {
  if (request.recoveryRequest) {
    return request.recoveryRequest;
  }
  return Object.freeze({
    id: `rreq:from:${request.id}`,
    athleteId: request.athleteId,
    conversationId: request.conversationId,
    message: request.message,
    intentHint: null,
    goalHint: null,
    sleepHours: null,
    sleepQuality: null,
    stressLevel: null,
    fatigueLevel: null,
    sorenessLevel: null,
    hrvScore: null,
    readinessHint: null,
    trainingLoadHint: null,
    constraints: Object.freeze([...request.constraints]),
    metadata: EMPTY_RECOVERY_AGENT_METADATA,
    createdAt: request.createdAt,
  });
}

export function deriveNutritionRequest(request: CoachRequest): NutritionRequest {
  if (request.nutritionRequest) {
    return request.nutritionRequest;
  }
  return Object.freeze({
    id: `nreq:from:${request.id}`,
    athleteId: request.athleteId,
    conversationId: request.conversationId,
    message: request.message,
    intentHint: null,
    goalHint: null,
    bodyWeightKg: null,
    activityLevel: null,
    constraints: Object.freeze([...request.constraints]),
    preferences: null,
    metadata: EMPTY_NUTRITION_AGENT_METADATA,
    createdAt: request.createdAt,
  });
}

export function isInvocableAgent(kind: SpecialistAgentKind): boolean {
  return (
    kind === SpecialistAgentKinds.WORKOUT ||
    kind === SpecialistAgentKinds.RECOVERY ||
    kind === SpecialistAgentKinds.NUTRITION
  );
}
