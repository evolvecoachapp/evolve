import { ToolCallBuilder } from "./ToolCallBuilder";
import { ToolExecutionContextBuilder } from "./ToolExecutionContextBuilder";
import type { ToolCall } from "../models/ToolCall";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";
import { freezeCallRequest } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable ToolCallRequest.
 */
export class ToolCallRequestBuilder {
  private id = "";
  private call: ToolCall | null = null;
  private context: ToolExecutionContext | null = null;
  private metadata: ToolExecutionMetadata = EMPTY_TOOL_EXECUTION_METADATA;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withCall(call: ToolCall): this {
    this.call = call;
    return this;
  }

  withToolCall(input: {
    readonly callId?: string;
    readonly toolId: string;
    readonly parameters?: Readonly<Record<string, unknown>>;
    readonly createdAt?: string;
  }): this {
    const createdAt = input.createdAt ?? this.createdAt;
    this.call = new ToolCallBuilder()
      .withId(input.callId ?? `call:${input.toolId}`)
      .withToolId(input.toolId)
      .withParameters(input.parameters ?? {})
      .withCreatedAt(createdAt)
      .build();
    return this;
  }

  withContext(context: ToolExecutionContext): this {
    this.context = context;
    return this;
  }

  withContextNow(now: string): this {
    this.context = new ToolExecutionContextBuilder().withNow(now).build();
    return this;
  }

  withMetadata(metadata: ToolExecutionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): ToolCallRequest {
    if (!this.id || !this.call || !this.context || !this.createdAt) {
      throw new Error("ToolCallRequestBuilder missing required fields");
    }

    return freezeCallRequest({
      id: this.id,
      call: this.call,
      context: this.context,
      metadata: this.metadata,
      createdAt: this.createdAt,
    });
  }
}
