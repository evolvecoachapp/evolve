import {
  createBackendHealth,
  createBackendRequest,
  createBackendResult,
  MOCK_BACKEND_CAPABILITIES,
  type BackendCapabilities,
  type BackendEndpoint,
  type BackendHealth,
  type BackendRequest,
  type BackendResponse,
  type BackendResult,
} from "../models";
import { isBackendRoute } from "../models/BackendRoute";
import { createDefaultBackendEndpoints } from "../routing";
import { BackendResponseMapper } from "../responses/BackendResponseMapper";
import type { BackendProvider } from "./BackendProvider";
import { BackendRequestDispatcher } from "./BackendRequestDispatcher";
import { BackendValidator } from "./BackendValidator";
import { createAdapterResult } from "../../../core/infrastructure/registry/AdapterResult";
import type { AdapterResult } from "../../../core/infrastructure/registry/AdapterResult";

/**
 * In-memory Mock Backend Provider.
 * Implements BackendAdapter. No HTTP. No networking. No sockets. No serialization.
 */
export class MockBackendProvider implements BackendProvider {
  readonly adapterId = "backend" as const;
  readonly providerId = "mock" as const;
  readonly capabilityFlags: BackendCapabilities = MOCK_BACKEND_CAPABILITIES;

  private readonly dispatcher: BackendRequestDispatcher;
  private readonly validator: BackendValidator;
  private readonly endpoints: readonly BackendEndpoint[];
  private sequence = 0;

  constructor(
    dispatcher: BackendRequestDispatcher = new BackendRequestDispatcher(),
    validator: BackendValidator = new BackendValidator(),
    endpoints: readonly BackendEndpoint[] = createDefaultBackendEndpoints(),
  ) {
    this.dispatcher = dispatcher;
    this.validator = validator;
    this.endpoints = Object.freeze([...endpoints]);
  }

  send(
    request: Readonly<Record<string, string>>,
  ): AdapterResult<string> {
    return this.toAdapterResult(this.sendRequest(this.toBackendRequest(request)));
  }

  execute(
    request: Readonly<Record<string, string>>,
  ): AdapterResult<string> {
    return this.toAdapterResult(
      this.executeRequest(this.toBackendRequest(request)),
    );
  }

  dispatch(
    request: Readonly<Record<string, string>>,
  ): AdapterResult<string> {
    return this.toAdapterResult(
      this.dispatchRequest(this.toBackendRequest(request)),
    );
  }

  health(): AdapterResult<string> {
    const result = this.getHealth();
    return createAdapterResult<string>({
      success: result.success,
      value: result.value?.status ?? null,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  capabilities(): AdapterResult<Readonly<Record<string, string>>> {
    const result = this.getCapabilities();
    if (!result.success || !result.value) {
      return createAdapterResult<Readonly<Record<string, string>>>({
        success: false,
        errorCode: result.errorCode,
        message: result.message,
      });
    }
    const caps = result.value;
    return createAdapterResult<Readonly<Record<string, string>>>({
      success: true,
      value: Object.freeze({
        supportsSend: String(caps.supportsSend),
        supportsExecute: String(caps.supportsExecute),
        supportsDispatch: String(caps.supportsDispatch),
        supportsHealth: String(caps.supportsHealth),
        supportsOffline: String(caps.supportsOffline),
        supportsListEndpoints: String(caps.supportsListEndpoints),
      }),
    });
  }

  listEndpoints(): AdapterResult<ReadonlyArray<string>> {
    const result = this.getEndpoints();
    return createAdapterResult<ReadonlyArray<string>>({
      success: result.success,
      value: result.value?.map((endpoint) => endpoint.route) ?? null,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  sendRequest(request: BackendRequest): BackendResult<BackendResponse> {
    return this.dispatcher.dispatch(request);
  }

  executeRequest(request: BackendRequest): BackendResult<BackendResponse> {
    return this.dispatcher.dispatch(
      createBackendRequest({
        requestId: request.requestId,
        route: request.route,
        operation: "execute",
        payload: request.payload,
        metadata: request.metadata,
      }),
    );
  }

  dispatchRequest(request: BackendRequest): BackendResult<BackendResponse> {
    return this.dispatcher.dispatch(request);
  }

  getHealth(): BackendResult<BackendHealth> {
    this.sequence += 1;
    const checkedAt = `1970-01-01T00:00:${String(this.sequence).padStart(2, "0")}.000Z`;
    const health = createBackendHealth({
      status: "ready",
      healthy: true,
      checkedAt,
      message: "mock backend ready",
      metadata: Object.freeze({ provider: "mock" }),
    });
    const validation = this.validator.validateHealth(health);
    if (!validation.valid) {
      return createBackendResult({
        success: false,
        value: health,
        errorCode: "invalid_health",
        message: validation.errors.join("; "),
      });
    }
    return createBackendResult({
      success: true,
      value: health,
    });
  }

  getCapabilities(): BackendResult<BackendCapabilities> {
    const validation = this.validator.validateCapabilities(
      this.capabilityFlags,
    );
    if (!validation.valid) {
      return createBackendResult({
        success: false,
        value: this.capabilityFlags,
        errorCode: "invalid_capabilities",
        message: validation.errors.join("; "),
      });
    }
    return createBackendResult({
      success: true,
      value: this.capabilityFlags,
    });
  }

  getEndpoints(): BackendResult<readonly BackendEndpoint[]> {
    const validation = this.validator.validateEndpoints(this.endpoints);
    if (!validation.valid) {
      return createBackendResult({
        success: false,
        value: this.endpoints,
        errorCode: "invalid_endpoints",
        message: validation.errors.join("; "),
      });
    }
    return createBackendResult({
      success: true,
      value: this.endpoints,
    });
  }

  private toBackendRequest(
    request: Readonly<Record<string, string>>,
  ): BackendRequest {
    this.sequence += 1;
    const routeValue = request.route ?? "/auth";
    const route = isBackendRoute(routeValue) ? routeValue : "/auth";
    return createBackendRequest({
      requestId: request.requestId ?? `mock-request-${this.sequence}`,
      route,
      operation: request.operation ?? "dispatch",
      payload: Object.freeze({ ...request }),
      metadata: Object.freeze({ provider: "mock" }),
    });
  }

  private toAdapterResult(
    result: BackendResult<BackendResponse>,
  ): AdapterResult<string> {
    return createAdapterResult<string>({
      success: result.success,
      value: result.value?.responseId ?? null,
      errorCode: result.errorCode,
      message: result.message,
    });
  }
}
