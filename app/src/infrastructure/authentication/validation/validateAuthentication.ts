import type { AuthenticationProvider } from "../provider/AuthenticationProvider";
import type { AuthenticationRegistry } from "../registry/AuthenticationRegistry";
import {
  createAuthenticationValidation,
  type AuthenticationValidation,
} from "../models/AuthenticationResult";
import { AUTHENTICATION_PROVIDER_TOKENS } from "../registry/AuthenticationProviderToken";
import { AuthenticationValidator } from "../provider/AuthenticationValidator";

/**
 * Validate authentication adapter wiring:
 * missing provider, duplicate provider, invalid session, invalid user,
 * missing immutable fields.
 */
export function validateAuthenticationBundle(input: {
  readonly registry?: AuthenticationRegistry | null;
  readonly provider?: AuthenticationProvider | null;
}): AuthenticationValidation {
  const errors: string[] = [];
  const validator = new AuthenticationValidator();

  if (!input.registry) {
    errors.push("Missing provider");
  } else {
    const registryValidation = input.registry.validate();
    errors.push(...registryValidation.errors);
  }

  if (!input.provider) {
    errors.push("Missing provider");
  } else {
    if (input.provider.adapterId !== "authentication") {
      errors.push("Contract compliance failure: authentication");
    }
    if (typeof input.provider.signIn !== "function") {
      errors.push("Provider compatibility failure: signIn missing");
    }
    if (typeof input.provider.signOut !== "function") {
      errors.push("Provider compatibility failure: signOut missing");
    }
    if (typeof input.provider.refreshSession !== "function") {
      errors.push("Provider compatibility failure: refreshSession missing");
    }
    if (typeof input.provider.getCurrentUser !== "function") {
      errors.push("Provider compatibility failure: getCurrentUser missing");
    }
    if (typeof input.provider.getCurrentSession !== "function") {
      errors.push("Provider compatibility failure: getCurrentSession missing");
    }
    if (typeof input.provider.isAuthenticated !== "function") {
      errors.push("Provider compatibility failure: isAuthenticated missing");
    }
    if (typeof input.provider.validateSession !== "function") {
      errors.push("Provider compatibility failure: validateSession missing");
    }

    if (input.registry) {
      for (const token of AUTHENTICATION_PROVIDER_TOKENS) {
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
    }

    const sessionResult = input.provider.getCurrentSession();
    if (sessionResult.value) {
      const sessionValidation = validator.validateSession(sessionResult.value);
      errors.push(...sessionValidation.errors);
    }

    const userResult = input.provider.getCurrentUser();
    if (userResult.value) {
      const userValidation = validator.validateUser(userResult.value);
      errors.push(...userValidation.errors);
    }
  }

  return createAuthenticationValidation(errors);
}
