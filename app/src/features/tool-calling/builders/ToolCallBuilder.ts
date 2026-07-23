import type { ToolCall } from "../models/ToolCall";
import type { ToolInput } from "../models/ToolInput";
import { EMPTY_TOOL_INPUT } from "../models/ToolInput";
import { freezeCall } from "../utils/freezeObjects";
import { normalizeToolId } from "../utils/normalizeToolId";

/**
 * Fluent builder for immutable ToolCall.
 */
export class ToolCallBuilder {
  private id = "";
  private toolId = "";
  private input: ToolInput = EMPTY_TOOL_INPUT;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withToolId(toolId: string): this {
    this.toolId = toolId;
    return this;
  }

  withInput(input: ToolInput): this {
    this.input = input;
    return this;
  }

  withParameters(parameters: Readonly<Record<string, unknown>>): this {
    this.input = Object.freeze({
      parameters: Object.freeze({ ...parameters }),
    });
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): ToolCall {
    if (!this.id || !this.toolId || !this.createdAt) {
      throw new Error("ToolCallBuilder missing required fields");
    }

    return freezeCall({
      id: this.id,
      toolId: normalizeToolId(this.toolId),
      input: this.input,
      createdAt: this.createdAt,
    });
  }
}
