import type { BackendError } from "./BackendError";
import type { BackendMetadata } from "./BackendMetadata";
import { createBackendMetadata } from "./BackendMetadata";
import type { BackendRoute } from "./BackendRoute";

/**
 * Backend response kinds — representation only, no transport.
 */
export const BACKEND_RESPONSE_KINDS = [
  "Success",
  "Failure",
  "Unavailable",
  "Unauthorized",
  "Forbidden",
  "Conflict",
  "ValidationError",
  "NotFound",
] as const;

export type BackendResponseKind = (typeof BACKEND_RESPONSE_KINDS)[number];

export function isBackendResponseKind(
  value: string,
): value is BackendResponseKind {
  return (BACKEND_RESPONSE_KINDS as readonly string[]).includes(value);
}

/**
 * Immutable backend response representation.
 */
export interface BackendResponse {
  readonly responseId: string;
  readonly requestId: string;
  readonly route: BackendRoute;
  readonly kind: BackendResponseKind;
  readonly status: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly error: BackendError | null;
  readonly metadata: BackendMetadata;
}

export function createBackendResponse(input: {
  readonly responseId: string;
  readonly requestId: string;
  readonly route: BackendRoute;
  readonly kind: BackendResponseKind;
  readonly status: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly error?: BackendError | null;
  readonly metadata?: Readonly<Record<string, string>>;
}): BackendResponse {
  return Object.freeze({
    responseId: input.responseId,
    requestId: input.requestId,
    route: input.route,
    kind: input.kind,
    status: input.status,
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    error: input.error ?? null,
    metadata: createBackendMetadata(input.metadata ?? {}),
  });
}
