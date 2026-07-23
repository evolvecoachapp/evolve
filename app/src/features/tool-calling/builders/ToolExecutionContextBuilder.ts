import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import { freezeContext } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable ToolExecutionContext.
 */
export class ToolExecutionContextBuilder {
  private conversationId: string | null = null;
  private athleteId: string | null = null;
  private streamId: string | null = null;
  private executionRequestId: string | null = null;
  private now = "";
  private attributes: Readonly<Record<string, unknown>> = Object.freeze({});

  withConversationId(conversationId: string | null): this {
    this.conversationId = conversationId;
    return this;
  }

  withAthleteId(athleteId: string | null): this {
    this.athleteId = athleteId;
    return this;
  }

  withStreamId(streamId: string | null): this {
    this.streamId = streamId;
    return this;
  }

  withExecutionRequestId(executionRequestId: string | null): this {
    this.executionRequestId = executionRequestId;
    return this;
  }

  withNow(now: string): this {
    this.now = now;
    return this;
  }

  withAttributes(attributes: Readonly<Record<string, unknown>>): this {
    this.attributes = attributes;
    return this;
  }

  build(): ToolExecutionContext {
    if (!this.now) {
      throw new Error("ToolExecutionContextBuilder missing required fields");
    }

    return freezeContext({
      conversationId: this.conversationId,
      athleteId: this.athleteId,
      streamId: this.streamId,
      executionRequestId: this.executionRequestId,
      now: this.now,
      attributes: this.attributes,
    });
  }
}
