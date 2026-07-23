import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionValidation } from "../models/ToolExecutionValidation";
import type { ToolRuntime } from "../models/ToolRuntime";
import type { ToolRuntimePackage } from "../models/ToolRuntimePackage";
import {
  createToolRuntimeService,
  type ToolRuntimeService,
  type ToolRuntimeServiceDeps,
} from "../services/ToolRuntimeService";
import type { ExecutionMetrics } from "../utils/executionMetrics";

function resolveService(
  service?: ToolRuntimeService,
  deps?: ToolRuntimeServiceDeps,
): ToolRuntimeService {
  return service ?? createToolRuntimeService(deps);
}

/**
 * Public API — execute an ActionPlan through the Tool Runtime.
 *
 * Does not expose internal engines / resolvers / pipelines.
 */
export async function executeActionPlan(options: {
  readonly actionPlan: ActionPlan;
  readonly planId?: string;
  readonly createdAt?: string;
  readonly conversationId?: string | null;
  readonly athleteId?: string | null;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly dryRun?: boolean;
  readonly service?: ToolRuntimeService;
  readonly adapters?: readonly IDomainToolAdapter[];
  readonly clock?: ToolRuntimeServiceDeps["clock"];
  readonly nowMs?: ToolRuntimeServiceDeps["nowMs"];
}): Promise<ToolRuntimePackage> {
  const {
    actionPlan,
    service,
    adapters,
    clock,
    nowMs,
    ...rest
  } = options;
  const resolved = resolveService(
    service,
    adapters || clock || nowMs ? { adapters, clock, nowMs } : undefined,
  );
  return resolved.executeActionPlan(actionPlan, rest);
}

/**
 * Public API — build a ToolExecutionPlan from an ActionPlan.
 */
export function buildExecutionPlan(options: {
  readonly actionPlan: ActionPlan;
  readonly planId?: string;
  readonly createdAt?: string;
  readonly service?: ToolRuntimeService;
  readonly adapters?: readonly IDomainToolAdapter[];
}): ToolExecutionPlan {
  const { actionPlan, service, adapters, ...rest } = options;
  const resolved = resolveService(
    service,
    adapters ? { adapters } : undefined,
  );
  return resolved.buildExecutionPlan(actionPlan, rest);
}

/**
 * Public API — validate an execution plan (and optional context).
 */
export function validateExecution(options: {
  readonly plan: ToolExecutionPlan;
  readonly context?: ToolExecutionContext;
  readonly service?: ToolRuntimeService;
  readonly adapters?: readonly IDomainToolAdapter[];
}): ToolExecutionValidation {
  const { plan, context, service, adapters } = options;
  const resolved = resolveService(
    service,
    adapters ? { adapters } : undefined,
  );
  return resolved.validateExecution(plan, context);
}

/**
 * Public API — estimate execution metrics without invoking adapters.
 */
export function estimateExecution(options: {
  readonly plan: ToolExecutionPlan;
  readonly service?: ToolRuntimeService;
}): ExecutionMetrics {
  return resolveService(options.service).estimateExecution(options.plan);
}

/**
 * Public API — describe the Tool Runtime configuration.
 */
export function describeRuntime(options: {
  readonly service?: ToolRuntimeService;
  readonly adapters?: readonly IDomainToolAdapter[];
} = {}): ToolRuntime {
  const resolved = resolveService(
    options.service,
    options.adapters ? { adapters: options.adapters } : undefined,
  );
  return resolved.describeRuntime();
}

export type { ToolRuntimeServiceDeps };
