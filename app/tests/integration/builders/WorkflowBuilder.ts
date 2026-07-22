import type { WorkflowContext } from "../../../src/features/workflow/models/WorkflowContext";
import { INTEGRATION_FIXED_TIMESTAMP } from "../shared/constants";

/**
 * Fluent builder for immutable WorkflowContext values.
 */
export class WorkflowBuilder {
  private conversationId: string | undefined = "conversation-integration-1";
  private athleteId: string | undefined = "athlete-1";
  private now: string = INTEGRATION_FIXED_TIMESTAMP;
  private metadata: Record<string, unknown> | undefined;

  withConversationId(conversationId: string | undefined): this {
    this.conversationId = conversationId;
    return this;
  }

  withAthleteId(athleteId: string | undefined): this {
    this.athleteId = athleteId;
    return this;
  }

  withNow(now: string): this {
    this.now = now;
    return this;
  }

  withMetadata(metadata: Readonly<Record<string, unknown>>): this {
    this.metadata = { ...metadata };
    return this;
  }

  build(): WorkflowContext {
    return Object.freeze({
      conversationId: this.conversationId,
      athleteId: this.athleteId,
      now: this.now,
      metadata: this.metadata
        ? Object.freeze({ ...this.metadata })
        : undefined,
    });
  }
}

export function buildWorkflow(): WorkflowBuilder {
  return new WorkflowBuilder();
}
