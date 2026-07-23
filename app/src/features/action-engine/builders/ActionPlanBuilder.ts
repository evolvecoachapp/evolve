import type { ActionConstraint } from "../models/ActionConstraint";
import type { ActionDependency } from "../models/ActionDependency";
import type { ActionIntent } from "../models/ActionIntent";
import { ActionIntents } from "../models/ActionIntent";
import type { ActionMetadata } from "../models/ActionMetadata";
import { EMPTY_ACTION_METADATA } from "../models/ActionMetadata";
import type { ActionPlan } from "../models/ActionPlan";
import type { ActionPriority } from "../models/ActionPriority";
import { ActionPriorities } from "../models/ActionPriority";
import type { ActionStatus } from "../models/ActionStatus";
import { ActionStatuses } from "../models/ActionStatus";
import type { ActionStep } from "../models/ActionStep";
import { freezeActionPlan } from "../utils/freezeActionPlan";
import { maxPriority } from "../utils/priorityHelpers";

/**
 * Fluent builder for immutable ActionPlan.
 */
export class ActionPlanBuilder {
  private id = "";
  private sourceResponseId = "";
  private intent: ActionIntent = ActionIntents.UNKNOWN;
  private steps: readonly ActionStep[] = Object.freeze([]);
  private dependencies: readonly ActionDependency[] = Object.freeze([]);
  private constraints: readonly ActionConstraint[] = Object.freeze([]);
  private priority: ActionPriority | null = null;
  private status: ActionStatus = ActionStatuses.PLANNED;
  private metadata: ActionMetadata = EMPTY_ACTION_METADATA;
  private createdAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withSourceResponseId(sourceResponseId: string): this {
    this.sourceResponseId = sourceResponseId;
    return this;
  }

  withIntent(intent: ActionIntent): this {
    this.intent = intent;
    return this;
  }

  withSteps(steps: readonly ActionStep[]): this {
    this.steps = steps;
    return this;
  }

  withDependencies(dependencies: readonly ActionDependency[]): this {
    this.dependencies = dependencies;
    return this;
  }

  withConstraints(constraints: readonly ActionConstraint[]): this {
    this.constraints = constraints;
    return this;
  }

  withPriority(priority: ActionPriority): this {
    this.priority = priority;
    return this;
  }

  withStatus(status: ActionStatus): this {
    this.status = status;
    return this;
  }

  withMetadata(metadata: ActionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): ActionPlan {
    if (!this.id || !this.sourceResponseId || !this.createdAt || !this.frozenAt) {
      throw new Error("ActionPlanBuilder missing required fields");
    }

    const derivedPriority =
      this.priority ??
      maxPriority(this.steps.map((s) => s.priority));

    return freezeActionPlan({
      id: this.id,
      sourceResponseId: this.sourceResponseId,
      intent: this.intent,
      steps: this.steps,
      dependencies: this.dependencies,
      constraints: this.constraints,
      priority: derivedPriority,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      frozenAt: this.frozenAt,
    });
  }
}
