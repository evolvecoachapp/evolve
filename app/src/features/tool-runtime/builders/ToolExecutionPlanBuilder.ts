import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionStatus } from "../models/ToolExecutionStatus";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";
import { freezeExecutionPlan } from "../utils/freezeExecution";
import { topologicalStepOrder } from "../utils/dependencyHelpers";

/**
 * Fluent builder for immutable ToolExecutionPlan.
 */
export class ToolExecutionPlanBuilder {
  private id = "";
  private actionPlanId = "";
  private sourceResponseId = "";
  private steps: readonly ToolExecutionStep[] = Object.freeze([]);
  private orderedStepIds: readonly string[] | null = null;
  private status: ToolExecutionStatus = ToolExecutionStatuses.PENDING;
  private metadata: ToolExecutionMetadata = EMPTY_TOOL_EXECUTION_METADATA;
  private sourcePlan: ActionPlan | null = null;
  private createdAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withActionPlanId(actionPlanId: string): this {
    this.actionPlanId = actionPlanId;
    return this;
  }

  withSourceResponseId(sourceResponseId: string): this {
    this.sourceResponseId = sourceResponseId;
    return this;
  }

  withSteps(steps: readonly ToolExecutionStep[]): this {
    this.steps = steps;
    return this;
  }

  withOrderedStepIds(orderedStepIds: readonly string[]): this {
    this.orderedStepIds = orderedStepIds;
    return this;
  }

  withStatus(status: ToolExecutionStatus): this {
    this.status = status;
    return this;
  }

  withMetadata(metadata: ToolExecutionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withSourcePlan(sourcePlan: ActionPlan): this {
    this.sourcePlan = sourcePlan;
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

  build(): ToolExecutionPlan {
    if (
      !this.id ||
      !this.actionPlanId ||
      !this.sourceResponseId ||
      !this.sourcePlan ||
      !this.createdAt ||
      !this.frozenAt
    ) {
      throw new Error("ToolExecutionPlanBuilder missing required fields");
    }

    const ordered =
      this.orderedStepIds ?? topologicalStepOrder(this.steps);

    return freezeExecutionPlan({
      id: this.id,
      actionPlanId: this.actionPlanId,
      sourceResponseId: this.sourceResponseId,
      steps: this.steps,
      orderedStepIds: ordered,
      status: this.status,
      metadata: this.metadata,
      sourcePlan: this.sourcePlan,
      createdAt: this.createdAt,
      frozenAt: this.frozenAt,
    });
  }
}
