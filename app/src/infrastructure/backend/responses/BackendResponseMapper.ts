import {
  createBackendError,
  createBackendResponse,
  type BackendRequest,
  type BackendResponse,
  type BackendResponseKind,
} from "../models";

/**
 * Maps deterministic dispatch outcomes to immutable BackendResponse values.
 * No transport. No serialization.
 */
export class BackendResponseMapper {
  map(input: {
    readonly request: BackendRequest;
    readonly responseId: string;
    readonly kind: BackendResponseKind;
    readonly status: string;
    readonly payload?: Readonly<Record<string, string>>;
    readonly errorCode?: string | null;
    readonly errorMessage?: string | null;
  }): BackendResponse {
    const error =
      input.kind === "Success"
        ? null
        : createBackendError({
            code: input.errorCode ?? input.kind,
            message: input.errorMessage ?? input.status,
          });

    return createBackendResponse({
      responseId: input.responseId,
      requestId: input.request.requestId,
      route: input.request.route,
      kind: input.kind,
      status: input.status,
      payload: input.payload ?? Object.freeze({ ...input.request.payload }),
      error,
      metadata: Object.freeze({
        ...input.request.metadata,
        kind: input.kind,
      }),
    });
  }
}
