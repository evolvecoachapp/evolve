import type { StreamStatus } from "./StreamStatus";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";

/**
 * Hard streaming foundation failure.
 */
export class StreamError extends Error {
  readonly code: string;
  readonly status: StreamStatus | null;
  readonly providerId: AIProviderId | null;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    options: {
      readonly status?: StreamStatus | null;
      readonly providerId?: AIProviderId | null;
      readonly details?: Readonly<Record<string, unknown>>;
    } = {},
  ) {
    super(message);
    this.name = "StreamError";
    this.code = code;
    this.status = options.status ?? null;
    this.providerId = options.providerId ?? null;
    this.details = Object.freeze({ ...(options.details ?? {}) });
  }
}

/**
 * Serializable error snapshot embedded in state / response.
 */
export interface StreamErrorSnapshot {
  readonly code: string;
  readonly message: string;
  readonly status: StreamStatus | null;
  readonly providerId: AIProviderId | null;
  readonly details: Readonly<Record<string, unknown>>;
}

export function toStreamErrorSnapshot(
  error: StreamError,
): StreamErrorSnapshot {
  return Object.freeze({
    code: error.code,
    message: error.message,
    status: error.status,
    providerId: error.providerId,
    details: error.details,
  });
}
