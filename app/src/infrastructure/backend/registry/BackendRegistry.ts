import type { BackendProvider } from "../provider/BackendProvider";
import type { BackendRegistration } from "./BackendRegistration";
import { createBackendRegistration } from "./BackendRegistration";
import { createBackendMetadata } from "../models/BackendMetadata";
import {
  BACKEND_PROVIDER_TOKENS,
  isBackendProviderToken,
  type BackendProviderToken,
} from "./BackendProviderToken";
import { BackendRegistrationError, BackendValidationError } from "./errors";
import type { BackendValidation } from "../models/BackendResult";
import { createBackendValidation } from "../models/BackendResult";

/**
 * In-memory registry of backend provider registrations + bound instances.
 */
export class BackendRegistry {
  private readonly registrations = new Map<
    BackendProviderToken,
    BackendRegistration
  >();
  private readonly providers = new Map<
    BackendProviderToken,
    BackendProvider
  >();
  private activeToken: BackendProviderToken | null = null;

  register(
    registration: BackendRegistration,
    provider: BackendProvider,
  ): void {
    const issues = this.validateRegistration(registration, provider);
    if (issues.length > 0) {
      throw new BackendValidationError(
        issues,
        `Cannot register backend provider: ${issues.join(", ")}`,
      );
    }

    if (this.registrations.has(registration.token)) {
      throw new BackendRegistrationError(
        registration.token,
        `Duplicate backend provider registration: ${registration.token}`,
      );
    }

    this.registrations.set(
      registration.token,
      Object.freeze({
        token: registration.token,
        name: registration.name,
        version: registration.version,
        providerId: registration.providerId,
        metadata: createBackendMetadata(registration.metadata),
      }),
    );
    this.providers.set(registration.token, provider);

    if (this.activeToken === null) {
      this.activeToken = registration.token;
    }
  }

  unregister(token: BackendProviderToken): boolean {
    this.providers.delete(token);
    const removed = this.registrations.delete(token);
    if (this.activeToken === token) {
      this.activeToken = this.registrations.keys().next().value ?? null;
    }
    return removed;
  }

  setActive(token: BackendProviderToken): void {
    if (!this.providers.has(token)) {
      throw new BackendRegistrationError(
        token,
        `Cannot activate unregistered backend provider: ${token}`,
      );
    }
    this.activeToken = token;
  }

  resolve(token: BackendProviderToken): BackendProvider | null {
    return this.providers.get(token) ?? null;
  }

  resolveActive(): BackendProvider | null {
    if (this.activeToken === null) {
      return null;
    }
    return this.providers.get(this.activeToken) ?? null;
  }

  resolveRegistration(
    token: BackendProviderToken,
  ): BackendRegistration | null {
    return this.registrations.get(token) ?? null;
  }

  has(token: BackendProviderToken): boolean {
    return this.registrations.has(token);
  }

  list(): readonly BackendRegistration[] {
    return Object.freeze([...this.registrations.values()]);
  }

  tokens(): readonly BackendProviderToken[] {
    return Object.freeze([...this.registrations.keys()]);
  }

  getActiveToken(): BackendProviderToken | null {
    return this.activeToken;
  }

  clear(): void {
    this.registrations.clear();
    this.providers.clear();
    this.activeToken = null;
  }

  validate(): BackendValidation {
    const errors: string[] = [];
    const seen = new Set<BackendProviderToken>();

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

    for (const required of BACKEND_PROVIDER_TOKENS) {
      if (!this.registrations.has(required)) {
        errors.push(`Missing provider: ${required}`);
      }
      if (!this.providers.has(required)) {
        errors.push(`Missing provider instance: ${required}`);
      }
    }

    return createBackendValidation(errors);
  }

  private validateRegistration(
    registration: BackendRegistration,
    provider: BackendProvider,
  ): string[] {
    const issues: string[] = [];

    if (!registration || typeof registration !== "object") {
      issues.push("Invalid registration: registration missing");
      return issues;
    }

    if (!isBackendProviderToken(registration.token)) {
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

    if (!isBackendProviderToken(registration.providerId)) {
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
        `Missing metadata: metadata object required for ${registration.token}`,
      );
    }

    if (!provider || typeof provider !== "object") {
      issues.push(`Missing provider: ${registration.token}`);
      return issues;
    }

    if (provider.providerId !== registration.token) {
      issues.push(`Contract compliance failure: ${registration.token}`);
    }

    if (provider.adapterId !== "backend") {
      issues.push(
        `Contract compliance failure: adapterId must be backend for ${registration.token}`,
      );
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
      if (typeof provider[method] !== "function") {
        issues.push(
          `Unsupported operations: ${method} missing on ${registration.token}`,
        );
      }
    }

    if (
      !provider.capabilityFlags ||
      typeof provider.capabilityFlags !== "object" ||
      Array.isArray(provider.capabilityFlags)
    ) {
      issues.push(`Invalid capabilities: ${registration.token}`);
    }

    return issues;
  }
}

export function createBackendRegistry(
  entries: readonly {
    readonly registration: BackendRegistration;
    readonly provider: BackendProvider;
  }[] = [],
): BackendRegistry {
  const registry = new BackendRegistry();
  for (const entry of entries) {
    registry.register(entry.registration, entry.provider);
  }
  return registry;
}

export { createBackendRegistration, type BackendRegistration };
