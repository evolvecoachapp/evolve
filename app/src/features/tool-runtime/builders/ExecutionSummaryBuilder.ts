import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolExecutionStatus } from "../models/ToolExecutionStatus";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import type { ToolExecutionSummary } from "../models/ToolExecutionSummary";
import { freezeExecutionSummary } from "../utils/freezeExecution";

/**
 * Fluent builder for immutable ToolExecutionSummary.
 */
export class ExecutionSummaryBuilder {
  private planId = "";
  private actionPlanId = "";
  private status: ToolExecutionStatus = ToolExecutionStatuses.PENDING;
  private stepCount = 0;
  private succeededCount = 0;
  private failedCount = 0;
  private skippedCount = 0;
  private complete = false;
  private message: string | null = null;

  withPlanId(planId: string): this {
    this.planId = planId;
    return this;
  }

  withActionPlanId(actionPlanId: string): this {
    this.actionPlanId = actionPlanId;
    return this;
  }

  withStatus(status: ToolExecutionStatus): this {
    this.status = status;
    return this;
  }

  withStepCount(stepCount: number): this {
    this.stepCount = stepCount;
    return this;
  }

  withSucceededCount(succeededCount: number): this {
    this.succeededCount = succeededCount;
    return this;
  }

  withFailedCount(failedCount: number): this {
    this.failedCount = failedCount;
    return this;
  }

  withSkippedCount(skippedCount: number): this {
    this.skippedCount = skippedCount;
    return this;
  }

  withComplete(complete: boolean): this {
    this.complete = complete;
    return this;
  }

  withMessage(message: string | null): this {
    this.message = message;
    return this;
  }

  fromResult(result: ToolExecutionResult): this {
    this.planId = result.planId;
    this.actionPlanId = result.actionPlanId;
    this.status = result.status;
    this.stepCount =
      result.completedStepIds.length +
      result.failedStepIds.length +
      result.skippedStepIds.length;
    this.succeededCount = result.completedStepIds.length;
    this.failedCount = result.failedStepIds.length;
    this.skippedCount = result.skippedStepIds.length;
    this.complete = true;
    this.message = result.message;
    return this;
  }

  build(): ToolExecutionSummary {
    if (!this.planId || !this.actionPlanId) {
      throw new Error("ExecutionSummaryBuilder missing required fields");
    }

    return freezeExecutionSummary({
      planId: this.planId,
      actionPlanId: this.actionPlanId,
      status: this.status,
      stepCount: this.stepCount,
      succeededCount: this.succeededCount,
      failedCount: this.failedCount,
      skippedCount: this.skippedCount,
      complete: this.complete,
      message: this.message,
    });
  }
}
