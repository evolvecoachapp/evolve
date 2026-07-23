import type { AIExecutionStage } from "./AIExecutionStage";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";

/**
 * Hard pipeline execution failure.
 */
export class AIExecutionError extends Error {
  readonly code: string;
  readonly stage: AIExecutionStage | null;
  readonly providerId: AIProviderId | null;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    options: {
      readonly stage?: AIExecutionStage | null;
      readonly providerId?: AIProviderId | null;
      readonly details?: Readonly<Record<string, unknown>>;
    } = {},
  ) {
    super(message);
    this.name = "AIExecutionError";
    this.code = code;
    this.stage = options.stage ?? null;
    this.providerId = options.providerId ?? null;
    this.details = Object.freeze({ ...(options.details ?? {}) });
  }
}

/**
 * Serializable error snapshot embedded in results / state.
 */
export interface AIExecutionErrorSnapshot {
  readonly code: string;
  readonly message: string;
  readonly stage: AIExecutionStage | null;
  readonly providerId: AIProviderId | null;
  readonly details: Readonly<Record<string, unknown>>;
}

export function toErrorSnapshot(
  error: AIExecutionError,
): AIExecutionErrorSnapshot {
  return Object.freeze({
    code: error.code,
    message: error.message,
    stage: error.stage,
    providerId: error.providerId,
    details: error.details,
  });
}
