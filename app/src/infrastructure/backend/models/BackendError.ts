import type { BackendMetadata } from "./BackendMetadata";
import { createBackendMetadata } from "./BackendMetadata";

/**
 * Immutable backend error representation (no transport).
 */
export interface BackendError {
  readonly code: string;
  readonly message: string;
  readonly metadata: BackendMetadata;
}

export function createBackendError(input: {
  readonly code: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): BackendError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    metadata: createBackendMetadata(input.metadata ?? {}),
  });
}
