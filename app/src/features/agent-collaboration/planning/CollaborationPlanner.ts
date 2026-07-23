import { buildCollaborationPlan } from "../builders/CollaborationPlanBuilder";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import {
  createDuplicateHandlingPolicy,
  type DuplicateHandlingPolicy,
} from "../policies/DuplicateHandlingPolicy";
import {
  createExecutionOrderingPolicy,
  type ExecutionOrderingPolicy,
} from "../policies/ExecutionOrderingPolicy";
import {
  createParticipantEligibilityPolicy,
  type ParticipantEligibilityPolicy,
} from "../policies/ParticipantEligibilityPolicy";
import {
  createExecutionPlanner,
  type ExecutionPlanner,
} from "./ExecutionPlanner";
import {
  createParticipantSelector,
  type ParticipantSelector,
} from "./ParticipantSelector";

export interface CollaborationPlannerDeps {
  readonly participantSelector?: ParticipantSelector;
  readonly executionPlanner?: ExecutionPlanner;
  readonly eligibilityPolicy?: ParticipantEligibilityPolicy;
  readonly duplicatePolicy?: DuplicateHandlingPolicy;
  readonly orderingPolicy?: ExecutionOrderingPolicy;
}

/**
 * Transforms a Coach request into an executable collaboration plan.
 * Planning NEVER executes anything.
 */
export class CollaborationPlanner {
  private readonly participantSelector: ParticipantSelector;
  private readonly executionPlanner: ExecutionPlanner;
  private readonly eligibilityPolicy: ParticipantEligibilityPolicy;
  private readonly duplicatePolicy: DuplicateHandlingPolicy;
  private readonly orderingPolicy: ExecutionOrderingPolicy;

  constructor(deps: CollaborationPlannerDeps = {}) {
    this.eligibilityPolicy =
      deps.eligibilityPolicy ?? createParticipantEligibilityPolicy();
    this.duplicatePolicy =
      deps.duplicatePolicy ?? createDuplicateHandlingPolicy();
    this.orderingPolicy =
      deps.orderingPolicy ?? createExecutionOrderingPolicy();
    this.participantSelector =
      deps.participantSelector ??
      createParticipantSelector({
        eligibilityPolicy: this.eligibilityPolicy,
        duplicatePolicy: this.duplicatePolicy,
        orderingPolicy: this.orderingPolicy,
      });
    this.executionPlanner =
      deps.executionPlanner ?? createExecutionPlanner();
  }

  plan(input: {
    readonly request: CollaborationRequest;
    readonly collaborationId: string;
    readonly planId?: string;
    readonly clock: () => string;
  }): CollaborationPlan {
    const now = input.clock();
    const planId = input.planId ?? `plan:${input.collaborationId}`;
    const participants = this.participantSelector.select(input.request);
    const { tasks, batches } = this.executionPlanner.plan({
      planId,
      request: input.request,
      participants,
    });

    const policies: readonly CollaborationPolicy[] = Object.freeze([
      this.eligibilityPolicy.policy,
      this.duplicatePolicy.policy,
      this.orderingPolicy.policy,
    ]);

    return buildCollaborationPlan({
      id: planId,
      requestId: input.request.id,
      collaborationId: input.collaborationId,
      participants,
      tasks,
      batches,
      policies,
      createdAt: now,
    });
  }
}

export function createCollaborationPlanner(
  deps: CollaborationPlannerDeps = {},
): CollaborationPlanner {
  return new CollaborationPlanner(deps);
}
