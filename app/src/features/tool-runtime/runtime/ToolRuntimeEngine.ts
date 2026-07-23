import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import { ExecutionContextBuilder } from "../builders/ExecutionContextBuilder";
import { ExecutionSummaryBuilder } from "../builders/ExecutionSummaryBuilder";
import { ToolExecutionPlanBuilder } from "../builders/ToolExecutionPlanBuilder";
import { ToolDispatcher } from "../dispatch/ToolDispatcher";
import { DEFAULT_EXECUTION_STRATEGY } from "../executors/ExecutionStrategy";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionRequest } from "../models/ToolExecutionRequest";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolRuntime } from "../models/ToolRuntime";
import type { ToolRuntimePackage } from "../models/ToolRuntimePackage";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import { ExecutionPipeline } from "../pipeline/ExecutionPipeline";
import type { FailurePolicy } from "../policies/FailurePolicy";
import type { OrderingPolicy } from "../policies/OrderingPolicy";
import type { SafetyPolicy } from "../policies/SafetyPolicy";
import { ToolResolver } from "../resolver/ToolResolver";
import { ExecutionCoordinator } from "./ExecutionCoordinator";
import { ExecutionContextManager } from "./ExecutionContextManager";
import { ExecutionScheduler } from "./ExecutionScheduler";
import { PolicySelector } from "../selectors/PolicySelector";
import { StrategySelector } from "../selectors/StrategySelector";
import { DEFAULT_PIPELINE } from "../selectors/PipelineSelector";
import { validateExecutionPlan } from "../validators/validateExecutionPlan";
import { validateExecutionContext } from "../validators/validateExecutionContext";
import {
  freezeExecutionRequest,
  freezePackage,
  freezeRuntime,
  freezeSnapshot,
  freezeValidation,
} from "../utils/freezeExecution";
import { computeExecutionStatistics } from "../utils/executionStatistics";
import { computeExecutionMetrics } from "../utils/executionMetrics";
import { describeRuntime as formatRuntime } from "../utils/formattingHelpers";

export interface ToolRuntimeEngineDeps {
  readonly adapters?: readonly IDomainToolAdapter[];
  readonly resolver?: ToolResolver;
  readonly clock?: () => string;
  readonly nowMs?: () => number;
  readonly failurePolicy?: FailurePolicy;
  readonly orderingPolicy?: OrderingPolicy;
  readonly safetyPolicy?: SafetyPolicy;
  readonly runtimeId?: string;
}

/**
 * Tool Runtime Engine — orchestrates ActionPlan execution via Domain Tool Adapters.
 *
 * No business logic. No domain execution directly. Only orchestration.
 */
export class ToolRuntimeEngine {
  readonly id: string;

  private readonly resolver: ToolResolver;
  private readonly scheduler: ExecutionScheduler;
  private readonly contextManager: ExecutionContextManager;
  private readonly coordinator: ExecutionCoordinator;
  private readonly pipeline: ExecutionPipeline;
  private readonly strategySelector: StrategySelector;
  private readonly policySelector: PolicySelector;
  private readonly clock: () => string;
  private readonly nowMs: () => number;
  private readonly safetyPolicy: SafetyPolicy;

  constructor(deps: ToolRuntimeEngineDeps = {}) {
    this.id = deps.runtimeId ?? "runtime:tool:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
    this.resolver =
      deps.resolver ?? new ToolResolver(deps.adapters ?? []);
    const policies = new PolicySelector().selectDefaults();
    this.safetyPolicy = deps.safetyPolicy ?? policies.safety;
    this.scheduler = new ExecutionScheduler(
      deps.orderingPolicy ?? policies.ordering,
    );
    this.contextManager = new ExecutionContextManager();
    this.coordinator = new ExecutionCoordinator();
    const dispatcher = new ToolDispatcher({
      adapterResolver: this.resolver.adapterResolver,
      clock: this.clock,
      nowMs: this.nowMs,
    });
    this.pipeline = new ExecutionPipeline({
      dispatcher,
      scheduler: this.scheduler,
      contextManager: this.contextManager,
      failurePolicy: deps.failurePolicy ?? policies.failure,
      clock: this.clock,
      nowMs: this.nowMs,
    });
    this.strategySelector = new StrategySelector();
    this.policySelector = new PolicySelector();
  }

  describe(): ToolRuntime {
    const policies = this.policySelector.selectDefaults();
    return freezeRuntime({
      id: this.id,
      name: "Tool Runtime Engine",
      version: "1.0.0",
      strategyId: DEFAULT_EXECUTION_STRATEGY.id,
      pipelineId: DEFAULT_PIPELINE.id,
      adapterIds: this.resolver.adapterResolver.listAdapterIds(),
      policyIds: this.policySelector.listPolicyIds(policies),
      createdAt: this.clock(),
    });
  }

  describeText(): string {
    return formatRuntime(this.describe());
  }

  buildExecutionPlan(
    actionPlan: ActionPlan,
    options: { readonly planId?: string; readonly createdAt?: string } = {},
  ): ToolExecutionPlan {
    const createdAt = options.createdAt ?? this.clock();
    const planId = options.planId ?? `texec:${actionPlan.id}`;
    const bindings = this.resolver.resolvePlan(actionPlan, planId);
    const steps = Object.freeze(bindings.map((b) => b.executionStep));

    return new ToolExecutionPlanBuilder()
      .withId(planId)
      .withActionPlanId(actionPlan.id)
      .withSourceResponseId(actionPlan.sourceResponseId)
      .withSteps(steps)
      .withStatus(
        steps.length === 0
          ? ToolExecutionStatuses.SKIPPED
          : ToolExecutionStatuses.READY,
      )
      .withMetadata({
        ...EMPTY_TOOL_EXECUTION_METADATA,
        sourcePlanId: actionPlan.id,
        runtimeId: this.id,
        tags: Object.freeze(["tool-runtime"]),
      })
      .withSourcePlan(actionPlan)
      .withCreatedAt(createdAt)
      .withFrozenAt(createdAt)
      .build();
  }

  buildContext(
    plan: ToolExecutionPlan,
    options: {
      readonly conversationId?: string | null;
      readonly athleteId?: string | null;
      readonly attributes?: Readonly<
        Record<string, string | number | boolean | null>
      >;
    } = {},
  ): ToolExecutionContext {
    return new ExecutionContextBuilder()
      .withId(`ctx:${plan.id}`)
      .withPlanId(plan.id)
      .withActionPlanId(plan.actionPlanId)
      .withSourceResponseId(plan.sourceResponseId)
      .withConversationId(options.conversationId ?? null)
      .withAthleteId(options.athleteId ?? null)
      .withRequestedAt(this.clock())
      .withAttributes(options.attributes ?? Object.freeze({}))
      .withMetadata({
        ...EMPTY_TOOL_EXECUTION_METADATA,
        sourcePlanId: plan.actionPlanId,
        runtimeId: this.id,
      })
      .build();
  }

  buildRequest(
    plan: ToolExecutionPlan,
    context: ToolExecutionContext,
  ): ToolExecutionRequest {
    const strategy = this.strategySelector.select(plan);
    return freezeExecutionRequest({
      id: `req:${plan.id}`,
      plan,
      context,
      strategyId: strategy.id,
      metadata: {
        ...EMPTY_TOOL_EXECUTION_METADATA,
        sourcePlanId: plan.actionPlanId,
        runtimeId: this.id,
      },
      createdAt: this.clock(),
    });
  }

  validate(plan: ToolExecutionPlan, context?: ToolExecutionContext) {
    const planValidation = validateExecutionPlan(
      plan,
      this.resolver.adapterResolver,
    );
    if (!context) return planValidation;
    const contextIssues = validateExecutionContext(context);
    const issues = Object.freeze([
      ...planValidation.issues,
      ...contextIssues,
    ]);
    return freezeValidation({
      valid: issues.length === 0,
      issues,
    });
  }

  estimate(plan: ToolExecutionPlan) {
    return computeExecutionMetrics(plan);
  }

  async execute(
    actionPlan: ActionPlan,
    options: {
      readonly planId?: string;
      readonly createdAt?: string;
      readonly conversationId?: string | null;
      readonly athleteId?: string | null;
      readonly attributes?: Readonly<
        Record<string, string | number | boolean | null>
      >;
      readonly dryRun?: boolean;
    } = {},
  ): Promise<ToolRuntimePackage> {
    const createdAt = options.createdAt ?? this.clock();
    const runtime = this.describe();
    const plan = this.buildExecutionPlan(actionPlan, {
      planId: options.planId,
      createdAt,
    });
    const context = this.buildContext(plan, options);
    const validation = this.validate(plan, context);

    const summary = new ExecutionSummaryBuilder()
      .withPlanId(plan.id)
      .withActionPlanId(plan.actionPlanId)
      .withStatus(plan.status)
      .withStepCount(plan.steps.length)
      .withSucceededCount(0)
      .withFailedCount(0)
      .withSkippedCount(0)
      .withComplete(false)
      .withMessage(null)
      .build();

    const snapshot = freezeSnapshot({
      plan,
      summary,
      statistics: computeExecutionStatistics(plan),
      capturedAt: createdAt,
    });

    if (options.dryRun || plan.steps.length === 0) {
      return freezePackage({
        runtime,
        plan,
        context,
        request: null,
        result: null,
        snapshot,
        validation,
        createdAt,
      });
    }

    if (!this.safetyPolicy.isSafe(plan)) {
      const unsafeValidation = freezeValidation({
        valid: false,
        issues: Object.freeze(
          this.safetyPolicy.safetyViolations(plan).map((v) =>
            Object.freeze({
              code: "integrity_violation",
              message: v,
              path: null,
            }),
          ),
        ),
      });
      return freezePackage({
        runtime,
        plan,
        context,
        request: null,
        result: null,
        snapshot,
        validation: unsafeValidation,
        createdAt,
      });
    }

    const request = this.buildRequest(plan, context);
    const startedMs = this.nowMs();
    const pipelineResult = await this.pipeline.run(request);
    const completedAt = this.clock();
    const result = this.coordinator.aggregate({
      request,
      pipelineResult,
      startedAt: pipelineResult.startedAt,
      completedAt,
      durationMs: this.nowMs() - startedMs,
    });

    const resultSummary = new ExecutionSummaryBuilder()
      .fromResult(result)
      .build();

    return freezePackage({
      runtime,
      plan,
      context,
      request,
      result,
      snapshot: freezeSnapshot({
        plan,
        summary: resultSummary,
        statistics: computeExecutionStatistics(plan),
        capturedAt: completedAt,
      }),
      validation,
      createdAt,
    });
  }

  async executePlan(
    plan: ToolExecutionPlan,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const request = this.buildRequest(plan, context);
    const startedMs = this.nowMs();
    const pipelineResult = await this.pipeline.run(request);
    return this.coordinator.aggregate({
      request,
      pipelineResult,
      startedAt: pipelineResult.startedAt,
      completedAt: this.clock(),
      durationMs: this.nowMs() - startedMs,
    });
  }
}
