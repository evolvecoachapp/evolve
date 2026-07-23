import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolExecutionValidation } from "../models/ToolExecutionValidation";
import type { ToolRuntime } from "../models/ToolRuntime";
import type { ToolRuntimePackage } from "../models/ToolRuntimePackage";
import {
  ToolRuntimeEngine,
  type ToolRuntimeEngineDeps,
} from "../runtime/ToolRuntimeEngine";
import type { ExecutionMetrics } from "../utils/executionMetrics";
import { describeExecutionPlan } from "../utils/formattingHelpers";

/**
 * Tool Runtime Service — coordinates engine orchestration.
 *
 * No business logic. No networking. No persistence. No provider SDKs.
 */
export class ToolRuntimeService {
  private readonly engine: ToolRuntimeEngine;

  constructor(deps: ToolRuntimeEngineDeps = {}) {
    this.engine = new ToolRuntimeEngine(deps);
  }

  describeRuntime(): ToolRuntime {
    return this.engine.describe();
  }

  buildExecutionPlan(
    actionPlan: ActionPlan,
    options?: { readonly planId?: string; readonly createdAt?: string },
  ): ToolExecutionPlan {
    return this.engine.buildExecutionPlan(actionPlan, options);
  }

  validateExecution(
    plan: ToolExecutionPlan,
    context?: ToolExecutionContext,
  ): ToolExecutionValidation {
    return this.engine.validate(plan, context);
  }

  estimateExecution(plan: ToolExecutionPlan): ExecutionMetrics {
    return this.engine.estimate(plan);
  }

  describePlan(plan: ToolExecutionPlan): readonly string[] {
    return describeExecutionPlan(plan);
  }

  async executeActionPlan(
    actionPlan: ActionPlan,
    options?: {
      readonly planId?: string;
      readonly createdAt?: string;
      readonly conversationId?: string | null;
      readonly athleteId?: string | null;
      readonly attributes?: Readonly<
        Record<string, string | number | boolean | null>
      >;
      readonly dryRun?: boolean;
    },
  ): Promise<ToolRuntimePackage> {
    return this.engine.execute(actionPlan, options);
  }

  async executePrepared(
    plan: ToolExecutionPlan,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    return this.engine.executePlan(plan, context);
  }
}

export function createToolRuntimeService(
  deps: ToolRuntimeEngineDeps = {},
): ToolRuntimeService {
  return new ToolRuntimeService(deps);
}

export type { ToolRuntimeEngineDeps as ToolRuntimeServiceDeps };
export type { IDomainToolAdapter };
