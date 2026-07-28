import {
  createBackendValidation,
  isBackendRoute,
  type BackendCapabilities,
  type BackendEndpoint,
  type BackendHealth,
  type BackendRequest,
  type BackendValidation,
} from "../models";
import { createDefaultBackendEndpoints } from "../routing";

/**
 * Deterministic backend validation.
 * Validates duplicate endpoints, invalid registrations, invalid capabilities,
 * missing metadata, unsupported operations.
 */
export class BackendValidator {
  validateRequest(
    request: BackendRequest | null | undefined,
  ): BackendValidation {
    const errors: string[] = [];

    if (!request || typeof request !== "object") {
      errors.push("invalid request");
      return createBackendValidation(errors);
    }

    if (
      typeof request.requestId !== "string" ||
      request.requestId.trim().length === 0
    ) {
      errors.push("missing immutable fields: requestId");
    }

    if (!isBackendRoute(request.route)) {
      errors.push("invalid registration: unknown route");
    }

    if (
      typeof request.operation !== "string" ||
      request.operation.trim().length === 0
    ) {
      errors.push("missing immutable fields: operation");
    }

    if (
      !request.payload ||
      typeof request.payload !== "object" ||
      Array.isArray(request.payload)
    ) {
      errors.push("missing immutable fields: payload");
    }

    if (
      !request.metadata ||
      typeof request.metadata !== "object" ||
      Array.isArray(request.metadata)
    ) {
      errors.push("missing metadata");
    }

    return createBackendValidation(errors);
  }

  validateCapabilities(
    capabilities: BackendCapabilities | null | undefined,
  ): BackendValidation {
    const errors: string[] = [];

    if (!capabilities || typeof capabilities !== "object") {
      errors.push("invalid capabilities");
      return createBackendValidation(errors);
    }

    const flags: (keyof BackendCapabilities)[] = [
      "supportsSend",
      "supportsExecute",
      "supportsDispatch",
      "supportsHealth",
      "supportsOffline",
      "supportsListEndpoints",
    ];

    for (const flag of flags) {
      if (typeof capabilities[flag] !== "boolean") {
        errors.push(`invalid capabilities: ${flag}`);
      }
    }

    if (
      !capabilities.supportsSend ||
      !capabilities.supportsExecute ||
      !capabilities.supportsDispatch ||
      !capabilities.supportsHealth ||
      !capabilities.supportsListEndpoints
    ) {
      errors.push("unsupported operations");
    }

    return createBackendValidation(errors);
  }

  validateEndpoints(
    endpoints: readonly BackendEndpoint[] | null | undefined,
  ): BackendValidation {
    const errors: string[] = [];

    if (!endpoints || !Array.isArray(endpoints)) {
      errors.push("invalid registration: endpoints missing");
      return createBackendValidation(errors);
    }

    const seenRoutes = new Set<string>();
    const seenIds = new Set<string>();

    for (const endpoint of endpoints) {
      if (!endpoint || typeof endpoint !== "object") {
        errors.push("invalid registration: endpoint");
        continue;
      }

      if (
        typeof endpoint.endpointId !== "string" ||
        endpoint.endpointId.trim().length === 0
      ) {
        errors.push("missing metadata: endpointId");
      } else if (seenIds.has(endpoint.endpointId)) {
        errors.push(`duplicate endpoints: ${endpoint.endpointId}`);
      } else {
        seenIds.add(endpoint.endpointId);
      }

      if (!isBackendRoute(endpoint.route)) {
        errors.push(`invalid registration: unknown route ${String(endpoint.route)}`);
      } else if (seenRoutes.has(endpoint.route)) {
        errors.push(`duplicate endpoints: ${endpoint.route}`);
      } else {
        seenRoutes.add(endpoint.route);
      }

      if (
        !endpoint.metadata ||
        typeof endpoint.metadata !== "object" ||
        Array.isArray(endpoint.metadata)
      ) {
        errors.push("missing metadata");
      }
    }

    return createBackendValidation(errors);
  }

  validateHealth(health: BackendHealth | null | undefined): BackendValidation {
    const errors: string[] = [];

    if (!health || typeof health !== "object") {
      errors.push("invalid health");
      return createBackendValidation(errors);
    }

    if (
      typeof health.checkedAt !== "string" ||
      health.checkedAt.trim().length === 0
    ) {
      errors.push("missing immutable fields: checkedAt");
    }

    if (
      !health.metadata ||
      typeof health.metadata !== "object" ||
      Array.isArray(health.metadata)
    ) {
      errors.push("missing metadata");
    }

    return createBackendValidation(errors);
  }

  validateDefaultCatalog(): BackendValidation {
    return this.validateEndpoints(createDefaultBackendEndpoints());
  }
}
