import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { WorkoutAgent } from "../models/WorkoutAgent";
import type { WorkoutAgentResult } from "../models/WorkoutAgentResult";
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
