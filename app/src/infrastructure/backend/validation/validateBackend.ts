import type { BackendProvider } from "../provider/BackendProvider";
import type { BackendRegistry } from "../registry/BackendRegistry";
import {
  createBackendValidation,
  type BackendValidation,
} from "../models/BackendResult";
import { BACKEND_PROVIDER_TOKENS } from "../registry/BackendProviderToken";
import { BackendValidator } from "../provider/BackendValidator";

/**
 * Validate backend adapter wiring:
 * duplicate endpoints, invalid registrations, invalid capabilities,
 * missing metadata, unsupported operations.
 */
export function validateBackendBundle(input: {
  readonly registry?: BackendRegistry | null;
  readonly provider?: BackendProvider | null;
}): BackendValidation {
  const errors: string[] = [];
  const validator = new BackendValidator();

  if (!input.registry) {
    errors.push("Missing provider");
  } else {
    const registryValidation = input.registry.validate();
    errors.push(...registryValidation.errors);
  }

  if (!input.provider) {
    errors.push("Missing provider");
  } else {
    if (input.provider.adapterId !== "backend") {
      errors.push("Contract compliance failure: backend");
    }

    const requiredMethods = [
      "send",
      "execute",
      "dispatch",
      "health",
      "capabilities",
      "listEndpoints",
    ] as const;

    for (const method of requiredMethods) {
      if (typeof input.provider[method] !== "function") {
        errors.push(`Unsupported operations: ${method} missing`);
      }
    }

    const capsValidation = validator.validateCapabilities(
      input.provider.capabilityFlags,
    );
    errors.push(...capsValidation.errors);

    const endpointsResult = input.provider.getEndpoints();
    if (endpointsResult.value) {
      const endpointValidation = validator.validateEndpoints(
        endpointsResult.value,
      );
      errors.push(...endpointValidation.errors);
    }

    if (input.registry) {
      for (const token of BACKEND_PROVIDER_TOKENS) {
        if (!input.registry.has(token)) {
          errors.push(`Missing provider: ${token}`);
        }
      }
      if (
        input.provider.providerId &&
        !input.registry.has(input.provider.providerId)
      ) {
        errors.push(`Missing provider: ${input.provider.providerId}`);
      }

      const registration = input.registry.resolveRegistration(
        input.provider.providerId,
      );
      if (!registration) {
        errors.push("Invalid registration");
      } else if (
        !registration.metadata ||
        typeof registration.metadata !== "object"
      ) {
        errors.push("Missing metadata");
      }
    }
  }

  return createBackendValidation(errors);
}
