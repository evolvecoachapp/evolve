import type { PipelineStepName } from "./PipelineStepName";

/**
 * Structured error captured for a failed pipeline step.
 */
export interface PipelineExecutionError {
  readonly code: string;
  readonly message: string;
  readonly step: PipelineStepName | null;
  readonly details: Readonly<Record<string, unknown>>;
}

/**
 * Domain error thrown by the Program Generation Orchestrator.
 */
export class ProgramGenerationError extends Error {
  readonly code: string;
  readonly step: PipelineStepName | null;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    options: {
      readonly step?: PipelineStepName | null;
      readonly details?: Readonly<Record<string, unknown>>;
    } = {},
  ) {
    super(message);
    this.name = "ProgramGenerationError";
    this.code = code;
    this.step = options.step ?? null;
    this.details = Object.freeze({ ...(options.details ?? {}) });
  }

  toPipelineError(): PipelineExecutionError {
    return Object.freeze({
      code: this.code,
      message: this.message,
      step: this.step,
      details: this.details,
    });
  }
}
