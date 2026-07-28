import type { SynchronizationEngine } from "../engine/SynchronizationEngine";
import type { SynchronizationProviderRegistration } from "./SynchronizationProviderRegistration";
import { createSynchronizationProviderMetadata } from "./SynchronizationProviderMetadata";
import {
  SYNCHRONIZATION_PROVIDER_TOKENS,
  isSynchronizationProviderToken,
  type SynchronizationProviderToken,
} from "./SynchronizationProviderToken";
import {
  SynchronizationProviderRegistrationError,
  SynchronizationProviderValidationError,
} from "./errors";
import type { SynchronizationValidation } from "../models/SynchronizationResult";
import { createSynchronizationValidation } from "../models/SynchronizationResult";

/**
 * In-memory registry of synchronization provider registrations + bound engines.
 */
export class SynchronizationRegistry {
  private readonly registrations = new Map<
    SynchronizationProviderToken,
    SynchronizationProviderRegistration
  >();
  private readonly engines = new Map<
    SynchronizationProviderToken,
    SynchronizationEngine
  >();
  private activeToken: SynchronizationProviderToken | null = null;

  register(
    registration: SynchronizationProviderRegistration,
    engine: SynchronizationEngine,
  ): void {
    const issues = this.validateRegistration(registration, engine);
    if (issues.length > 0) {
      throw new SynchronizationProviderValidationError(
        issues,
        `Cannot register synchronization provider: ${issues.join(", ")}`,
      );
    }

    if (this.registrations.has(registration.token)) {
      throw new SynchronizationProviderRegistrationError(
        registration.token,
        `Duplicate synchronization provider registration: ${registration.token}`,
      );
    }

    this.registrations.set(
      registration.token,
      Object.freeze({
        token: registration.token,
        name: registration.name,
        version: registration.version,
        providerId: registration.providerId,
        metadata: createSynchronizationProviderMetadata(registration.metadata),
      }),
    );
    this.engines.set(registration.token, engine);

    if (this.activeToken === null) {
      this.activeToken = registration.token;
    }
  }

  unregister(token: SynchronizationProviderToken): boolean {
    this.engines.delete(token);
    const removed = this.registrations.delete(token);
    if (this.activeToken === token) {
      this.activeToken = this.registrations.keys().next().value ?? null;
    }
    return removed;
  }

  setActive(token: SynchronizationProviderToken): void {
    if (!this.engines.has(token)) {
      throw new SynchronizationProviderRegistrationError(
        token,
        `Cannot activate unregistered synchronization provider: ${token}`,
      );
    }
    this.activeToken = token;
  }

  resolve(token: SynchronizationProviderToken): SynchronizationEngine | null {
    return this.engines.get(token) ?? null;
  }

  resolveActive(): SynchronizationEngine | null {
    if (this.activeToken === null) {
      return null;
    }
    return this.engines.get(this.activeToken) ?? null;
  }

  resolveRegistration(
    token: SynchronizationProviderToken,
  ): SynchronizationProviderRegistration | null {
    return this.registrations.get(token) ?? null;
  }

  has(token: SynchronizationProviderToken): boolean {
    return this.registrations.has(token);
  }

  list(): readonly SynchronizationProviderRegistration[] {
    return Object.freeze([...this.registrations.values()]);
  }

  tokens(): readonly SynchronizationProviderToken[] {
    return Object.freeze([...this.registrations.keys()]);
  }

  getActiveToken(): SynchronizationProviderToken | null {
    return this.activeToken;
  }

  clear(): void {
    this.registrations.clear();
    this.engines.clear();
    this.activeToken = null;
  }

  validate(): SynchronizationValidation {
    const errors: string[] = [];
    const seen = new Set<SynchronizationProviderToken>();

    if (this.registrations.size === 0) {
      errors.push("Missing provider");
    }

    for (const registration of this.registrations.values()) {
      if (seen.has(registration.token)) {
        errors.push(`Duplicate provider: ${registration.token}`);
      }
      seen.add(registration.token);

      const engine = this.engines.get(registration.token);
      if (!engine) {
        errors.push(`Missing provider: ${registration.token}`);
        continue;
      }
      errors.push(...this.validateRegistration(registration, engine));
    }

    for (const required of SYNCHRONIZATION_PROVIDER_TOKENS) {
      if (!this.registrations.has(required)) {
        errors.push(`Missing provider: ${required}`);
      }
      if (!this.engines.has(required)) {
        errors.push(`Missing provider instance: ${required}`);
      }
    }

    return createSynchronizationValidation(errors);
  }

  private validateRegistration(
    registration: SynchronizationProviderRegistration,
    engine: SynchronizationEngine,
  ): string[] {
    const issues: string[] = [];

    if (!registration || typeof registration !== "object") {
      issues.push("Invalid registration: registration missing");
      return issues;
    }

    if (!isSynchronizationProviderToken(registration.token)) {
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

    if (!isSynchronizationProviderToken(registration.providerId)) {
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

    if (!engine || typeof engine !== "object") {
      issues.push(`Missing provider: ${registration.token}`);
      return issues;
    }

    if (engine.providerId !== registration.token) {
      issues.push(`Contract compliance failure: ${registration.token}`);
    }

    if (engine.adapterId !== "synchronization") {
      issues.push(
        `Contract compliance failure: adapterId must be synchronization for ${registration.token}`,
      );
    }

    const requiredMethods = [
      "push",
      "pull",
      "getStatus",
      "getQueue",
      "getState",
      "getStatistics",
      "enqueue",
      "dequeue",
      "peek",
      "markCompleted",
      "markFailed",
      "cancel",
      "clear",
      "retry",
      "validate",
    ] as const;

    for (const method of requiredMethods) {
      if (typeof engine[method] !== "function") {
        issues.push(
          `Provider compatibility failure: ${method} missing on ${registration.token}`,
        );
      }
    }

    return issues;
  }
}

export function createSynchronizationRegistry(
  entries: readonly {
    readonly registration: SynchronizationProviderRegistration;
    readonly engine: SynchronizationEngine;
  }[] = [],
): SynchronizationRegistry {
  const registry = new SynchronizationRegistry();
  for (const entry of entries) {
    registry.register(entry.registration, entry.engine);
  }
  return registry;
}
