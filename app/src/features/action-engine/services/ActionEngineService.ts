import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import { ActionPlanBuilder } from "../builders/ActionPlanBuilder";
import { ActionProposalBuilder } from "../builders/ActionProposalBuilder";
import {
  createExecutionContext,
} from "../executors/ExecutionContext";
import { PlanningActionExecutor } from "../executors/PlanningActionExecutor";
import type { ActionCandidate } from "../models/ActionCandidate";
import type { ActionContext } from "../models/ActionContext";
import type { ActionExecutionPlan } from "../models/ActionExecutionPlan";
import type { ActionIntent } from "../models/ActionIntent";
import { ActionIntents } from "../models/ActionIntent";
import { EMPTY_ACTION_METADATA } from "../models/ActionMetadata";
import type { ActionPackage } from "../models/ActionPackage";
import type { ActionPlan } from "../models/ActionPlan";
import type { ActionSummary } from "../models/ActionSummary";
import type { ActionValidation } from "../models/ActionValidation";
import { ActionStatuses } from "../models/ActionStatus";
import {
  DefaultConflictPolicy,
  type ConflictPolicy,
} from "../policies/ConflictPolicy";
import {
  DefaultDependencyPolicy,
  type DependencyPolicy,
} from "../policies/DependencyPolicy";
import {
  DefaultExecutionPolicy,
  type ExecutionPolicy,
} from "../policies/ExecutionPolicy";
import {
  DefaultPriorityPolicy,
  type PriorityPolicy,
} from "../policies/PriorityPolicy";
import {
  DefaultSafetyPolicy,
  type SafetyPolicy,
} from "../policies/SafetyPolicy";
import { CompositePlanner } from "../planners/CompositePlanner";
import type { ActionPlanner } from "../planners/ActionPlanner";
import { ActionSelector } from "../selectors/ActionSelector";
import { DependencySelector } from "../selectors/DependencySelector";
import { PlannerSelector } from "../selectors/PlannerSelector";
import { PrioritySelector } from "../selectors/PrioritySelector";
import {
  describeActions,
} from "../utils/formattingHelpers";
import {
  freezeContext,
  freezePackage,
  freezeSnapshot,
} from "../utils/freezeActionPlan";
import { buildSequenceDependencies } from "../utils/dependencyHelpers";
import { computePlanMetrics, type PlanMetrics } from "../utils/planMetrics";
import { computeActionStatistics } from "../utils/statisticsHelpers";
import { summarizeActionPlan as summarizePlan } from "../utils/summarizeActionPlan";
import { validateActionPlan as runValidate } from "../validators/validateActionPlan";
import { priorityRank } from "../utils/priorityHelpers";

export interface BuildActionPlanOptions {
  readonly response: CoachResponse;
  readonly planId?: string;
  readonly createdAt?: string;
  readonly planner?: ActionPlanner;
}

/**
 * Coordinates CoachResponse → immutable ActionPlan transformation.
 * No networking. No domain execution. No provider SDKs. No AI calls.
 */
export class ActionEngineService {
  constructor(
    private readonly plannerSelector = new PlannerSelector(),
    private readonly prioritySelector = new PrioritySelector(),
    private readonly actionSelector = new ActionSelector(),
    private readonly dependencySelector = new DependencySelector(),
    private readonly conflictPolicy: ConflictPolicy = new DefaultConflictPolicy(),
    private readonly priorityPolicy: PriorityPolicy = new DefaultPriorityPolicy(),
    private readonly dependencyPolicy: DependencyPolicy = new DefaultDependencyPolicy(),
    private readonly executionPolicy: ExecutionPolicy = new DefaultExecutionPolicy(),
    private readonly safetyPolicy: SafetyPolicy = new DefaultSafetyPolicy(),
    private readonly executor = new PlanningActionExecutor(),
  ) {}

  buildActionPlan(options: BuildActionPlanOptions): ActionPackage {
    const createdAt = options.createdAt ?? new Date().toISOString();
    const response = options.response;
    const planId = options.planId ?? `plan:${response.id}`;

    const context = this.buildContext(response, createdAt);
    const planner =
      options.planner ??
      this.plannerSelector.selectComposite(response);

    const rawSteps = planner.plan(response, planId);
    const orderedSteps = this.priorityPolicy.orderByPriority(rawSteps);
    // Re-assign stable order after priority sort for plan consistency
    const steps = Object.freeze(
      orderedSteps.map((step, index) =>
        Object.freeze({ ...step, order: index }),
      ),
    );

    const dependencies = buildSequenceDependencies(steps, planId);
    const priority = this.prioritySelector.selectPlanPriority(steps);
    const intent = this.resolveIntent(context, steps.length);

    const plan = new ActionPlanBuilder()
      .withId(planId)
      .withSourceResponseId(response.id)
      .withIntent(intent)
      .withSteps(steps)
      .withDependencies(dependencies)
      .withPriority(priority)
      .withStatus(
        steps.length === 0 ? ActionStatuses.SKIPPED : ActionStatuses.PLANNED,
      )
      .withMetadata({
        ...EMPTY_ACTION_METADATA,
        sourceResponseId: response.id,
        plannerId: planner.id,
        tags: Object.freeze(["action-engine"]),
        attributes: Object.freeze({
          conflictCount: this.conflictPolicy.findConflicts(steps).length,
          dependencySatisfied: this.dependencyPolicy.isSatisfied(steps),
          safetyOk: this.safetyPolicy.isSafe(
            // provisional for safety check
            {
              id: planId,
              sourceResponseId: response.id,
              intent,
              steps,
              dependencies,
              constraints: Object.freeze([]),
              priority,
              status: ActionStatuses.PLANNED,
              metadata: EMPTY_ACTION_METADATA,
              createdAt,
              frozenAt: createdAt,
            },
          ),
        }),
      })
      .withCreatedAt(createdAt)
      .withFrozenAt(createdAt)
      .build();

    const candidates = this.toCandidates(steps);
    const proposal = new ActionProposalBuilder()
      .withId(`proposal:${planId}`)
      .withSourceResponseId(response.id)
      .withIntent(intent)
      .withCandidates(candidates)
      .withPreferredPriority(priority)
      .withCreatedAt(createdAt)
      .build();

    const validation = runValidate(plan);
    const summary = summarizePlan(plan);
    const statistics = computeActionStatistics(plan, candidates.length);
    const snapshot = freezeSnapshot({
      plan,
      summary,
      statistics,
      capturedAt: createdAt,
    });

    let executionPlan: ActionExecutionPlan | null = null;
    if (this.executionPolicy.canPrepare(plan) && plan.steps.length > 0) {
      const request = this.executor.prepare(
        plan,
        createExecutionContext({
          id: `ctx:${planId}`,
          planId: plan.id,
          sourceResponseId: response.id,
          requestedAt: createdAt,
          attributes: Object.freeze({}),
        }),
      );
      executionPlan = request.executionPlan;
    }

    return freezePackage({
      plan,
      context,
      proposal,
      executionPlan,
      snapshot,
      validation,
      createdAt,
    });
  }

  validateActionPlan(plan: ActionPlan): ActionValidation {
    return runValidate(plan);
  }

  summarizeActionPlan(plan: ActionPlan): ActionSummary {
    return summarizePlan(plan);
  }

  estimateExecution(plan: ActionPlan): PlanMetrics {
    return computePlanMetrics(plan);
  }

  describeActions(plan: ActionPlan): readonly string[] {
    return describeActions(plan.steps);
  }

  private buildContext(
    response: CoachResponse,
    createdAt: string,
  ): ActionContext {
    return freezeContext({
      sourceResponseId: response.id,
      intent: this.inferIntentFromResponse(response),
      preferredPriority: this.prioritySelector.selectPlanPriority(
        Object.freeze([]),
      ),
      hasExercises: response.exercises.length > 0,
      hasNutrition: response.nutrition.length > 0,
      hasRecovery: response.recovery.length > 0,
      hasRecommendations: response.recommendations.length > 0,
      hasActions: response.actions.length > 0,
      hasQuestions: response.questions.length > 0,
      hasWarnings: response.warnings.length > 0,
      confidenceScore: response.confidence.score,
      createdAt,
    });
  }

  private inferIntentFromResponse(response: CoachResponse): ActionIntent {
    const flags = [
      response.exercises.length > 0 ||
        response.actions.some((a) => a.kind === "start_workout"),
      response.nutrition.length > 0,
      response.recovery.length > 0,
      response.recommendations.length > 0,
      response.questions.length > 0,
      response.insights.length > 0,
      response.actions.length > 0,
    ].filter(Boolean).length;

    if (flags > 1) return ActionIntents.COMPOSITE;
    if (response.exercises.length > 0) return ActionIntents.START_WORKOUT;
    if (response.nutrition.length > 0) return ActionIntents.ADJUST_NUTRITION;
    if (response.recovery.length > 0) return ActionIntents.RECOVER;
    if (response.recommendations.length > 0) return ActionIntents.SET_GOAL;
    if (response.questions.length > 0) return ActionIntents.SCHEDULE_REMINDER;
    if (response.insights.length > 0) return ActionIntents.TRACK_PROGRESS;
    if (response.actions.length > 0) return ActionIntents.COACH_FOLLOWUP;
    return ActionIntents.UNKNOWN;
  }

  private resolveIntent(
    context: ActionContext,
    stepCount: number,
  ): ActionIntent {
    if (stepCount === 0) return ActionIntents.UNKNOWN;
    return context.intent === ActionIntents.UNKNOWN
      ? ActionIntents.COMPOSITE
      : context.intent;
  }

  private toCandidates(
    steps: readonly import("../models/ActionStep").ActionStep[],
  ): readonly ActionCandidate[] {
    return Object.freeze(
      steps.map((step) =>
        Object.freeze({
          id: `candidate:${step.id}`,
          type: step.type,
          intent: step.intent,
          label: step.label,
          description: step.description,
          target: step.target,
          arguments: step.arguments,
          priority: step.priority,
          sourceIds: step.sourceIds,
          score: priorityRank(step.priority),
        }),
      ),
    );
  }
}

export function createActionEngineService(): ActionEngineService {
  return new ActionEngineService();
}

// Keep selectors referenced for DI / testing harnesses
export type ActionEngineSelectors = {
  actionSelector: ActionSelector;
  dependencySelector: DependencySelector;
};

export function createDefaultPlanners(): ActionPlanner {
  return new CompositePlanner();
}
