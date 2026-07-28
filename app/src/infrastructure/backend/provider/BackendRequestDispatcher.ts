import {
  createBackendResult,
  type BackendRequest,
  type BackendResponse,
  type BackendResponseKind,
  type BackendResult,
} from "../models";
import { isBackendRoute } from "../models/BackendRoute";
import { BackendResponseMapper } from "../responses/BackendResponseMapper";
import { BackendValidator } from "./BackendValidator";

/**
 * Deterministic backend request dispatcher.
 * No networking. No HTTP. No sockets. No serialization.
 */
export class BackendRequestDispatcher {
  private readonly mapper: BackendResponseMapper;
  private readonly validator: BackendValidator;
  private sequence = 0;

  constructor(
    mapper: BackendResponseMapper = new BackendResponseMapper(),
    validator: BackendValidator = new BackendValidator(),
  ) {
    this.mapper = mapper;
    this.validator = validator;
  }

  dispatch(request: BackendRequest): BackendResult<BackendResponse> {
    const validation = this.validator.validateRequest(request);
    if (!validation.valid) {
      const response = this.mapper.map({
        request: request ?? {
          requestId: "invalid",
          route: "/auth",
          operation: "dispatch",
          payload: Object.freeze({}),
          metadata: Object.freeze({}),
        },
        responseId: this.nextResponseId(),
        kind: "ValidationError",
        status: "validation_error",
        errorCode: "validation_error",
        errorMessage: validation.errors.join("; "),
      });
      return createBackendResult({
        success: false,
        value: response,
        errorCode: "validation_error",
        message: validation.errors.join("; "),
      });
    }

    if (!isBackendRoute(request.route)) {
      const response = this.mapper.map({
        request,
        responseId: this.nextResponseId(),
        kind: "NotFound",
        status: "not_found",
        errorCode: "not_found",
        errorMessage: `Unknown route: ${request.route}`,
      });
      return createBackendResult({
        success: false,
        value: response,
        errorCode: "not_found",
        message: `Unknown route: ${request.route}`,
      });
    }

    const kind = this.resolveKind(request);
    const response = this.mapper.map({
      request,
      responseId: this.nextResponseId(),
      kind,
      status: kind === "Success" ? "success" : kind.toLowerCase(),
      payload: Object.freeze({
        ...request.payload,
        route: request.route,
        operation: request.operation,
      }),
      errorCode: kind === "Success" ? null : kind,
      errorMessage:
        kind === "Success" ? null : `Deterministic ${kind} for ${request.route}`,
    });

    return createBackendResult({
      success: kind === "Success",
      value: response,
      errorCode: kind === "Success" ? null : kind,
      message:
        kind === "Success"
          ? null
          : `Deterministic ${kind} for ${request.route}`,
    });
  }

  private resolveKind(request: BackendRequest): BackendResponseKind {
    const forced = request.payload.kind;
    if (
      forced === "Failure" ||
      forced === "Unavailable" ||
      forced === "Unauthorized" ||
      forced === "Forbidden" ||
      forced === "Conflict" ||
      forced === "ValidationError" ||
      forced === "NotFound"
    ) {
      return forced;
    }
    return "Success";
  }

  private nextResponseId(): string {
    this.sequence += 1;
    return `mock-response-${this.sequence}`;
  }
}
