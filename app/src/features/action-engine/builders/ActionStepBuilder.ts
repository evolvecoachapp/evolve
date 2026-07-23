import type { ActionArgument } from "../models/ActionArgument";
import type { ActionConstraint } from "../models/ActionConstraint";
import type { ActionIntent } from "../models/ActionIntent";
import { ActionIntents } from "../models/ActionIntent";
import type { ActionMetadata } from "../models/ActionMetadata";
import { EMPTY_ACTION_METADATA } from "../models/ActionMetadata";
import type { ActionPriority } from "../models/ActionPriority";
import { ActionPriorities } from "../models/ActionPriority";
import type { ActionStatus } from "../models/ActionStatus";
import { ActionStatuses } from "../models/ActionStatus";
import type { ActionStep } from "../models/ActionStep";
import type { ActionTarget } from "../models/ActionTarget";
import type { ActionType } from "../models/ActionType";
import { ActionTypes } from "../models/ActionType";
import { freezeStep } from "../utils/freezeActionPlan";

/**
 * Fluent builder for immutable ActionStep.
 */
export class ActionStepBuilder {
  private id = "";
  private planId = "";
  private type: ActionType = ActionTypes.SYSTEM;
  private intent: ActionIntent = ActionIntents.UNKNOWN;
  private label = "";
  private description: string | null = null;
  private target: ActionTarget | null = null;
  private arguments: readonly ActionArgument[] = Object.freeze([]);
  private constraints: readonly ActionConstraint[] = Object.freeze([]);
  private priority: ActionPriority = ActionPriorities.MEDIUM;
  private status: ActionStatus = ActionStatuses.PLANNED;
  private dependsOn: readonly string[] = Object.freeze([]);
  private order = 0;
  private sourceIds: readonly string[] = Object.freeze([]);
  private metadata: ActionMetadata = EMPTY_ACTION_METADATA;

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withPlanId(planId: string): this {
    this.planId = planId;
    return this;
  }

  withType(type: ActionType): this {
    this.type = type;
    return this;
  }

  withIntent(intent: ActionIntent): this {
    this.intent = intent;
    return this;
  }

  withLabel(label: string): this {
    this.label = label;
    return this;
  }

  withDescription(description: string | null): this {
    this.description = description;
    return this;
  }

  withTarget(target: ActionTarget | null): this {
    this.target = target;
    return this;
  }

  withArguments(args: readonly ActionArgument[]): this {
    this.arguments = args;
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

  withDependsOn(dependsOn: readonly string[]): this {
    this.dependsOn = dependsOn;
    return this;
  }

  withOrder(order: number): this {
    this.order = order;
    return this;
  }

  withSourceIds(sourceIds: readonly string[]): this {
    this.sourceIds = sourceIds;
    return this;
  }

  withMetadata(metadata: ActionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  build(): ActionStep {
    if (!this.id || !this.planId || !this.label) {
      throw new Error("ActionStepBuilder missing required fields");
    }

    return freezeStep({
      id: this.id,
      planId: this.planId,
      type: this.type,
      intent: this.intent,
      label: this.label,
      description: this.description,
      target: this.target,
      arguments: this.arguments,
      constraints: this.constraints,
      priority: this.priority,
      status: this.status,
      dependsOn: this.dependsOn,
      order: this.order,
      sourceIds: this.sourceIds,
      metadata: this.metadata,
    });
  }
}
