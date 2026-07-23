import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import { EMPTY_RUNTIME_ATTRIBUTES } from "../models/ToolExecutionContext";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";
import { freezeExecutionContext } from "../utils/freezeExecution";

/**
 * Fluent builder for immutable ToolExecutionContext.
 */
export class ExecutionContextBuilder {
  private id = "";
  private planId = "";
  private actionPlanId = "";
  private sourceResponseId = "";
  private conversationId: string | null = null;
  private athleteId: string | null = null;
  private requestedAt = "";
  private attributes: Readonly<
    Record<string, string | number | boolean | null>
  > = EMPTY_RUNTIME_ATTRIBUTES;
  private metadata: ToolExecutionMetadata = EMPTY_TOOL_EXECUTION_METADATA;

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withPlanId(planId: string): this {
    this.planId = planId;
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

  withConversationId(conversationId: string | null): this {
    this.conversationId = conversationId;
    return this;
  }

  withAthleteId(athleteId: string | null): this {
    this.athleteId = athleteId;
    return this;
  }

  withRequestedAt(requestedAt: string): this {
    this.requestedAt = requestedAt;
    return this;
  }

  withAttributes(
    attributes: Readonly<Record<string, string | number | boolean | null>>,
  ): this {
    this.attributes = attributes;
    return this;
  }

  withMetadata(metadata: ToolExecutionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  build(): ToolExecutionContext {
    if (
      !this.id ||
      !this.planId ||
      !this.actionPlanId ||
      !this.sourceResponseId ||
      !this.requestedAt
    ) {
      throw new Error("ExecutionContextBuilder missing required fields");
    }

    return freezeExecutionContext({
      id: this.id,
      planId: this.planId,
      actionPlanId: this.actionPlanId,
      sourceResponseId: this.sourceResponseId,
      conversationId: this.conversationId,
      athleteId: this.athleteId,
      requestedAt: this.requestedAt,
      attributes: this.attributes,
      metadata: this.metadata,
    });
  }
}
