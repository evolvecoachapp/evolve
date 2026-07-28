import type { AuthenticationProvider } from "../provider/AuthenticationProvider";
import type { AuthenticationProviderRegistration } from "./AuthenticationProviderRegistration";
import { createAuthenticationProviderRegistration } from "./AuthenticationProviderRegistration";
import { createAuthenticationProviderMetadata } from "./AuthenticationProviderMetadata";
import {
  AUTHENTICATION_PROVIDER_TOKENS,
  isAuthenticationProviderToken,
  type AuthenticationProviderToken,
} from "./AuthenticationProviderToken";
import {
  AuthenticationProviderRegistrationError,
  AuthenticationProviderValidationError,
} from "./errors";
import type { AuthenticationValidation } from "../models/AuthenticationResult";
import { createAuthenticationValidation } from "../models/AuthenticationResult";

/**
 * In-memory registry of authentication provider registrations + bound instances.
 */
export class AuthenticationRegistry {
  private readonly registrations = new Map<
    AuthenticationProviderToken,
    AuthenticationProviderRegistration
  >();
  private readonly providers = new Map<
    AuthenticationProviderToken,
    AuthenticationProvider
  >();
  private activeToken: AuthenticationProviderToken | null = null;

  register(
    registration: AuthenticationProviderRegistration,
    provider: AuthenticationProvider,
  ): void {
    const issues = this.validateRegistration(registration, provider);
    if (issues.length > 0) {
      throw new AuthenticationProviderValidationError(
        issues,
        `Cannot register authentication provider: ${issues.join(", ")}`,
      );
    }

    if (this.registrations.has(registration.token)) {
      throw new AuthenticationProviderRegistrationError(
        registration.token,
        `Duplicate authentication provider registration: ${registration.token}`,
      );
    }

    this.registrations.set(
      registration.token,
      Object.freeze({
        token: registration.token,
        name: registration.name,
        version: registration.version,
        providerId: registration.providerId,
        metadata: createAuthenticationProviderMetadata(registration.metadata),
      }),
    );
    this.providers.set(registration.token, provider);

    if (this.activeToken === null) {
      this.activeToken = registration.token;
    }
  }

  unregister(token: AuthenticationProviderToken): boolean {
    this.providers.delete(token);
    const removed = this.registrations.delete(token);
    if (this.activeToken === token) {
      this.activeToken = this.registrations.keys().next().value ?? null;
    }
    return removed;
  }

  setActive(token: AuthenticationProviderToken): void {
    if (!this.providers.has(token)) {
      throw new AuthenticationProviderRegistrationError(
        token,
        `Cannot activate unregistered authentication provider: ${token}`,
      );
    }
    this.activeToken = token;
  }

  resolve(
    token: AuthenticationProviderToken,
  ): AuthenticationProvider | null {
    return this.providers.get(token) ?? null;
  }

  resolveActive(): AuthenticationProvider | null {
    if (this.activeToken === null) {
      return null;
    }
    return this.providers.get(this.activeToken) ?? null;
  }

  resolveRegistration(
    token: AuthenticationProviderToken,
  ): AuthenticationProviderRegistration | null {
    return this.registrations.get(token) ?? null;
  }

  has(token: AuthenticationProviderToken): boolean {
    return this.registrations.has(token);
  }

  list(): readonly AuthenticationProviderRegistration[] {
    return Object.freeze([...this.registrations.values()]);
  }

  tokens(): readonly AuthenticationProviderToken[] {
    return Object.freeze([...this.registrations.keys()]);
  }

  getActiveToken(): AuthenticationProviderToken | null {
    return this.activeToken;
  }

  clear(): void {
    this.registrations.clear();
    this.providers.clear();
    this.activeToken = null;
  }

  validate(): AuthenticationValidation {
    const errors: string[] = [];
    const seen = new Set<AuthenticationProviderToken>();

    if (this.registrations.size === 0) {
      errors.push("Missing provider");
    }

    for (const registration of this.registrations.values()) {
      if (seen.has(registration.token)) {
        errors.push(`Duplicate provider: ${registration.token}`);
      }
      seen.add(registration.token);

      const provider = this.providers.get(registration.token);
      if (!provider) {
        errors.push(`Missing provider: ${registration.token}`);
        continue;
      }
      errors.push(...this.validateRegistration(registration, provider));
    }

    for (const required of AUTHENTICATION_PROVIDER_TOKENS) {
      if (!this.registrations.has(required)) {
        errors.push(`Missing provider: ${required}`);
      }
      if (!this.providers.has(required)) {
        errors.push(`Missing provider instance: ${required}`);
      }
    }

    return createAuthenticationValidation(errors);
  }

  private validateRegistration(
    registration: AuthenticationProviderRegistration,
    provider: AuthenticationProvider,
  ): string[] {
    const issues: string[] = [];

    if (!registration || typeof registration !== "object") {
      issues.push("Invalid registration: registration missing");
      return issues;
    }

    if (!isAuthenticationProviderToken(registration.token)) {
      issues.push("Invalid registration: unknown provider token");
    }

    if (
      typeof registration.name !== "string" ||
      registration.name.trim().length === 0
    ) {
      issues.push(`Invalid metadata: name required for ${registration.token}`);
    }

    if (
      typeof registration.version !== "string" ||
      registration.version.trim().length === 0
    ) {
      issues.push(
        `Invalid metadata: version required for ${registration.token}`,
      );
    }

    if (!isAuthenticationProviderToken(registration.providerId)) {
      issues.push(
        `Invalid registration: unknown providerId for ${registration.token}`,
      );
    }

    if (registration.token !== registration.providerId) {
      issues.push(
        `Contract compliance failure: token/providerId mismatch for ${registration.token}`,
      );
    }

    if (
      !registration.metadata ||
      typeof registration.metadata !== "object" ||
      Array.isArray(registration.metadata)
    ) {
      issues.push(
        `Invalid metadata: metadata object required for ${registration.token}`,
      );
    }

    if (!provider || typeof provider !== "object") {
      issues.push(`Missing provider: ${registration.token}`);
      return issues;
    }

    if (provider.providerId !== registration.token) {
      issues.push(`Contract compliance failure: ${registration.token}`);
    }

    if (provider.adapterId !== "authentication") {
      issues.push(
        `Contract compliance failure: adapterId must be authentication for ${registration.token}`,
      );
    }

    const requiredMethods = [
      "signIn",
      "signOut",
      "refreshSession",
      "getSession",
      "getCurrentUser",
      "getCurrentSession",
      "isAuthenticated",
      "validateSession",
    ] as const;

    for (const method of requiredMethods) {
      if (typeof provider[method] !== "function") {
        issues.push(
          `Provider compatibility failure: ${method} missing on ${registration.token}`,
        );
      }
    }

    return issues;
  }
}

export function createAuthenticationRegistry(
  entries: readonly {
    readonly registration: AuthenticationProviderRegistration;
    readonly provider: AuthenticationProvider;
  }[] = [],
): AuthenticationRegistry {
  const registry = new AuthenticationRegistry();
  for (const entry of entries) {
    registry.register(entry.registration, entry.provider);
  }
  return registry;
}

export {
  createAuthenticationProviderRegistration,
  type AuthenticationProviderRegistration,
};
