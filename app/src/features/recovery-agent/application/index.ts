import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import type { RecoveryAgent } from "../models/RecoveryAgent";
import type { RecoveryAgentResult } from "../models/RecoveryAgentResult";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import {
  createRecoveryAgentService,
  type RecoveryAgentService,
  type RecoveryAgentServiceDeps,
} from "../services/RecoveryAgentService";

function resolveService(
  service?: RecoveryAgentService,
  deps?: RecoveryAgentServiceDeps,
): RecoveryAgentService {
  return service ?? createRecoveryAgentService(deps);
}

export function processRecoveryRequest(options: {
  readonly request: RecoveryRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: RecoveryAgentService;
  readonly clock?: RecoveryAgentServiceDeps["clock"];
  readonly nowMs?: RecoveryAgentServiceDeps["nowMs"];
}): RecoveryAgentResult {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.processRecoveryRequest(rest);
}

export function buildRecoveryPlan(options: {
  readonly request: RecoveryRequest;
  readonly conversationContext?: ConversationContext | null;
  readonly coachResponse?: CoachResponse | null;
  readonly actionPlan?: ActionPlan | null;
  readonly toolExecutionResult?: ToolExecutionResult | null;
  readonly memoryTurnCount?: number;
  readonly service?: RecoveryAgentService;
  readonly clock?: RecoveryAgentServiceDeps["clock"];
  readonly nowMs?: RecoveryAgentServiceDeps["nowMs"];
}): RecoveryPlan {
  const { service, clock, nowMs, ...rest } = options;
  const resolved = resolveService(
    service,
    clock || nowMs ? { clock, nowMs } : undefined,
  );
  return resolved.buildRecoveryPlan(rest);
}

export function evaluateRecovery(options: {
  readonly plan: RecoveryPlan;
  readonly service?: RecoveryAgentService;
}): RecoveryValidation {
  return resolveService(options.service).evaluateRecovery(options.plan);
}

export function describeRecoveryCapabilities(options: {
  readonly service?: RecoveryAgentService;
  readonly clock?: RecoveryAgentServiceDeps["clock"];
} = {}): RecoveryAgent {
  const resolved = resolveService(
    options.service,
    options.clock ? { clock: options.clock } : undefined,
  );
  return resolved.describeCapabilities();
}

export function validateRecoveryPlan(options: {
  readonly plan: RecoveryPlan;
  readonly service?: RecoveryAgentService;
}): RecoveryValidation {
  return resolveService(options.service).validateRecoveryPlan(options.plan);
}

export type { RecoveryAgentServiceDeps };
