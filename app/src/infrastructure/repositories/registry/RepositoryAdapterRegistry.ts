import type { RepositoryAdapterRegistration } from "./RepositoryAdapterRegistration";
import { createRepositoryAdapterRegistration } from "./RepositoryAdapterRegistration";
import { createRepositoryAdapterMetadata } from "./RepositoryAdapterMetadata";
import {
  isRepositoryAdapterToken,
  REPOSITORY_ADAPTER_TOKENS,
  type RepositoryAdapterToken,
} from "./RepositoryAdapterToken";
import type { RepositoryAdapterMap } from "./RepositoryAdapterMap";
import type { RepositoryAdapterInstance } from "./RepositoryAdapterMap";
import {
  RepositoryAdapterRegistrationError,
  RepositoryAdapterValidationError,
} from "./errors";

export interface RepositoryAdapterValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function freezeValidation(
  errors: readonly string[],
): RepositoryAdapterValidation {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}

function freezeRegistration(
  registration: RepositoryAdapterRegistration,
): RepositoryAdapterRegistration {
  return Object.freeze({
    token: registration.token,
    name: registration.name,
    version: registration.version,
    repositoryId: registration.repositoryId,
    metadata: createRepositoryAdapterMetadata(registration.metadata),
  });
}

/**
 * In-memory registry of repository adapter registrations + bound instances.
 * Adapters delegate to SQLite repositories; registry holds wiring only.
 */
export class RepositoryAdapterRegistry {
  private readonly registrations = new Map<
    RepositoryAdapterToken,
    RepositoryAdapterRegistration
  >();
  private readonly adapters = new Map<
    RepositoryAdapterToken,
    RepositoryAdapterInstance
  >();

  register(
    registration: RepositoryAdapterRegistration,
    adapter: RepositoryAdapterInstance,
  ): void {
    const issues = this.validateRegistration(registration, adapter);
    if (issues.length > 0) {
      throw new RepositoryAdapterValidationError(
        issues,
        `Cannot register repository adapter: ${issues.join(", ")}`,
      );
    }

    if (this.registrations.has(registration.token)) {
      throw new RepositoryAdapterRegistrationError(
        registration.token,
        `Duplicate repository adapter registration: ${registration.token}`,
      );
    }

    this.registrations.set(
      registration.token,
      freezeRegistration(registration),
    );
    this.adapters.set(registration.token, adapter);
  }

  unregister(token: RepositoryAdapterToken): boolean {
    this.adapters.delete(token);
    return this.registrations.delete(token);
  }

  resolve(
    token: RepositoryAdapterToken,
  ): RepositoryAdapterInstance | null {
    return this.adapters.get(token) ?? null;
  }

  resolveRegistration(
    token: RepositoryAdapterToken,
  ): RepositoryAdapterRegistration | null {
    return this.registrations.get(token) ?? null;
  }

  has(token: RepositoryAdapterToken): boolean {
    return this.registrations.has(token);
  }

  list(): readonly RepositoryAdapterRegistration[] {
    return Object.freeze([...this.registrations.values()]);
  }

  tokens(): readonly RepositoryAdapterToken[] {
    return Object.freeze([...this.registrations.keys()]);
  }

  getAdapters(): Partial<RepositoryAdapterMap> {
    const map: Partial<{
      -readonly [K in RepositoryAdapterToken]: RepositoryAdapterMap[K];
    }> = {};
    for (const token of REPOSITORY_ADAPTER_TOKENS) {
      const adapter = this.adapters.get(token);
      if (adapter) {
        (map as Record<string, RepositoryAdapterInstance>)[token] = adapter;
      }
    }
    return Object.freeze({ ...map });
  }

  clear(): void {
    this.registrations.clear();
    this.adapters.clear();
  }

  validate(): RepositoryAdapterValidation {
    const errors: string[] = [];
    const seen = new Set<RepositoryAdapterToken>();

    for (const registration of this.registrations.values()) {
      if (seen.has(registration.token)) {
        errors.push(`Duplicate registrations: ${registration.token}`);
      }
      seen.add(registration.token);

      const adapter = this.adapters.get(registration.token);
      if (!adapter) {
        errors.push(`Missing repository: ${registration.token}`);
        continue;
      }
      errors.push(...this.validateRegistration(registration, adapter));
    }

    for (const required of REPOSITORY_ADAPTER_TOKENS) {
      if (!this.registrations.has(required)) {
        errors.push(`Missing repository: ${required}`);
      }
      if (!this.adapters.has(required)) {
        errors.push(`Missing adapter instance: ${required}`);
      }
    }

    return freezeValidation(errors);
  }

  private validateRegistration(
    registration: RepositoryAdapterRegistration,
    adapter: RepositoryAdapterInstance,
  ): string[] {
    const issues: string[] = [];

    if (!registration || typeof registration !== "object") {
      issues.push("Invalid registration: registration missing");
      return issues;
    }

    if (!isRepositoryAdapterToken(registration.token)) {
      issues.push("Invalid registration: unknown adapter token");
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

    if (!isRepositoryAdapterToken(registration.repositoryId)) {
      issues.push(
        `Invalid registration: unknown repositoryId for ${registration.token}`,
      );
    }

    if (registration.token !== registration.repositoryId) {
      issues.push(
        `Contract compliance failure: token/repositoryId mismatch for ${registration.token}`,
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

    if (!adapter || typeof adapter !== "object") {
      issues.push(`Missing repository: ${registration.token}`);
      return issues;
    }

    if (adapter.repositoryId !== registration.token) {
      issues.push(`Contract compliance failure: ${registration.token}`);
    }

    if (typeof adapter.findById !== "function") {
      issues.push(
        `Repository compatibility failure: findById missing on ${registration.token}`,
      );
    }
    if (typeof adapter.save !== "function") {
      issues.push(
        `Repository compatibility failure: save missing on ${registration.token}`,
      );
    }
    if (typeof adapter.delete !== "function") {
      issues.push(
        `Repository compatibility failure: delete missing on ${registration.token}`,
      );
    }
    if (typeof adapter.list !== "function") {
      issues.push(
        `Repository compatibility failure: list missing on ${registration.token}`,
      );
    }
    if (typeof adapter.exists !== "function") {
      issues.push(
        `Repository compatibility failure: exists missing on ${registration.token}`,
      );
    }

    return issues;
  }
}

export function createRepositoryAdapterRegistry(
  entries: readonly {
    readonly registration: RepositoryAdapterRegistration;
    readonly adapter: RepositoryAdapterInstance;
  }[] = [],
): RepositoryAdapterRegistry {
  const registry = new RepositoryAdapterRegistry();
  for (const entry of entries) {
    registry.register(entry.registration, entry.adapter);
  }
  return registry;
}

export {
  createRepositoryAdapterRegistration,
  type RepositoryAdapterRegistration,
};
