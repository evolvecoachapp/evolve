import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import { createToolExecutionError } from "../../tool-calling/models/ToolExecutionError";
import type { ToolExecutionError } from "../../tool-calling/models/ToolExecutionError";
import type { ToolOutput } from "../../tool-calling/models/ToolOutput";
import { freezeFoundationResult } from "../../tool-calling/utils/freezeObjects";

/**
 * Fluent builder for immutable FoundationToolResult.
 *
 * Mapping / orchestration only — no domain logic.
 */
export class FoundationToolResultBuilder {
  private executionId = "";
  private requestId = "";
  private callId = "";
  private toolId = "";
  private output: ToolOutput | null = null;
  private error: ToolExecutionError | null = null;
  private status: FoundationToolResult["status"] = "succeeded";
  private durationMs: number | null = null;
  private completedAt = "";

  withExecutionId(executionId: string): this {
    this.executionId = executionId;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withCallId(callId: string): this {
    this.callId = callId;
    return this;
  }

  withToolId(toolId: string): this {
    this.toolId = toolId;
    return this;
  }

  withOutput(output: ToolOutput | null): this {
    this.output = output;
    return this;
  }

  withData(data: unknown): this {
    this.output = Object.freeze({ data });
    return this;
  }

  withError(error: ToolExecutionError | null): this {
    this.error = error;
    return this;
  }

  withStatus(status: FoundationToolResult["status"]): this {
    this.status = status;
    return this;
  }

  withDurationMs(durationMs: number | null): this {
    this.durationMs = durationMs;
    return this;
  }

  withCompletedAt(completedAt: string): this {
    this.completedAt = completedAt;
    return this;
  }

  succeeded(data: unknown = null): this {
    this.status = "succeeded";
    this.output = Object.freeze({ data });
    this.error = null;
    return this;
  }

  failed(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ): this {
    this.status = "failed";
    this.output = null;
    this.error = createToolExecutionError(code, message, details);
    return this;
  }

  fromRequest(parts: {
    readonly requestId: string;
    readonly callId: string;
    readonly toolId: string;
    readonly executionId?: string;
    readonly completedAt: string;
    readonly durationMs?: number | null;
  }): this {
    this.requestId = parts.requestId;
    this.callId = parts.callId;
    this.toolId = parts.toolId;
    this.executionId = parts.executionId ?? `exec:${parts.callId}`;
    this.completedAt = parts.completedAt;
    if (parts.durationMs !== undefined) {
      this.durationMs = parts.durationMs;
    }
    return this;
  }

  build(): FoundationToolResult {
    return freezeFoundationResult({
      executionId: this.executionId,
      requestId: this.requestId,
      callId: this.callId,
      toolId: this.toolId,
      output: this.output,
      error: this.error,
      status: this.status,
      durationMs: this.durationMs,
      completedAt: this.completedAt,
    });
  }
}
