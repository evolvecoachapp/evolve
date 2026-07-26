import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentGenerateResult } from "../models/WorkoutAgentGenerateResult";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
import type { WorkoutDomainPayloads } from "../models/WorkoutDomainPayloads";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import {
  createWorkoutAgentService,
  type WorkoutAgentService,
  type WorkoutAgentServiceDeps,
} from "../services/WorkoutAgentService";

function resolveService(
  service?: WorkoutAgentService,
  deps?: WorkoutAgentServiceDeps,
): WorkoutAgentService {
  return service ?? createWorkoutAgentService(deps);
}

/**
 * Public API — process a workout request through the Workout Agent.
 */
export function processWorkoutRequest(options: {
  readonly request: WorkoutRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: WorkoutAgentService;
  readonly clock?: WorkoutAgentServiceDeps["clock"];
  readonly nowMs?: WorkoutAgentServiceDeps["nowMs"];
}): WorkoutAgentResult {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.processWorkoutRequest(rest);
}

/**
 * Public API — build an immutable workout plan proposal.
 */
export function buildWorkoutPlan(options: {
  readonly request: WorkoutRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: WorkoutAgentService;
  readonly clock?: WorkoutAgentServiceDeps["clock"];
  readonly nowMs?: WorkoutAgentServiceDeps["nowMs"];
}): WorkoutPlanProposal {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.buildWorkoutPlan(rest);
}

/**
 * Public API — generate a workout via Program Generation domain orchestration.
 */
export async function generateWorkout(options: {
  readonly request: WorkoutRequest;
  readonly generationRequest: WorkoutGenerationRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly domainPayloads?: WorkoutDomainPayloads;
  readonly service?: WorkoutAgentService;
  readonly clock?: WorkoutAgentServiceDeps["clock"];
  readonly nowMs?: WorkoutAgentServiceDeps["nowMs"];
}): Promise<WorkoutAgentGenerateResult> {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.generateWorkout(rest);
}

/**
 * Public API — adapt a workout via Training Adaptation Engine orchestration.
 */
export async function adaptWorkout(options: {
  readonly request: WorkoutRequest;
  readonly adaptationRequest: TrainingAdaptationRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly domainPayloads?: WorkoutDomainPayloads;
  readonly service?: WorkoutAgentService;
  readonly clock?: WorkoutAgentServiceDeps["clock"];
  readonly nowMs?: WorkoutAgentServiceDeps["nowMs"];
}): Promise<WorkoutAgentResult> {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.adaptWorkout(rest);
}

/**
 * Public API — evaluate a workout plan proposal.
 */
export function evaluateWorkout(options: {
  readonly proposal: WorkoutPlanProposal;
  readonly service?: WorkoutAgentService;
}): WorkoutValidation {
  return resolveService(options.service).evaluateWorkout(options.proposal);
}

/**
 * Public API — describe Workout Agent capabilities.
 */
export function describeWorkoutCapabilities(options: {
  readonly service?: WorkoutAgentService;
  readonly clock?: WorkoutAgentServiceDeps["clock"];
} = {}): WorkoutAgent {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeCapabilities();
}

/**
 * Public API — validate a workout plan proposal.
 */
export function validateWorkoutPlan(options: {
  readonly proposal: WorkoutPlanProposal;
  readonly service?: WorkoutAgentService;
}): WorkoutValidation {
  return resolveService(options.service).validateWorkoutPlan(options.proposal);
}

export type { WorkoutAgentServiceDeps };
