import type { ToolExecutionError } from "../models/ToolExecutionError";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolOutput } from "../models/ToolOutput";
import { freezeExecutionResult } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable ToolExecutionResult.
 */
export class ToolResultBuilder {
  private output: ToolOutput | null = null;
  private error: ToolExecutionError | null = null;
  private status: ToolExecutionResult["status"] = "succeeded";
  private durationMs: number | null = null;

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

  withStatus(status: ToolExecutionResult["status"]): this {
    this.status = status;
    return this;
  }

  withDurationMs(durationMs: number | null): this {
    this.durationMs = durationMs;
    return this;
  }

  succeeded(data: unknown = null): this {
    this.status = "succeeded";
    this.output = Object.freeze({ data });
    this.error = null;
    return this;
  }

  failed(error: ToolExecutionError): this {
    this.status = "failed";
    this.output = null;
    this.error = error;
    return this;
  }

  build(): ToolExecutionResult {
    return freezeExecutionResult({
      output: this.output,
      error: this.error,
      status: this.status,
      durationMs: this.durationMs,
    });
  }
}
