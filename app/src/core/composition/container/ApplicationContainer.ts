import type { ServiceLifecycle } from "./ServiceLifecycle";
import {
  CircularDependencyError,
  ContainerFrozenError,
  DependencyValidationError,
  DuplicateRegistrationError,
  InvalidResolutionError,
  MissingRegistrationError,
} from "./ContainerErrors";

export type ServiceFactory<T> = () => T;

export interface RegistrationOptions {
  readonly lifecycle?: ServiceLifecycle;
}

interface Registration<T> {
  readonly factory: ServiceFactory<T>;
  readonly lifecycle: ServiceLifecycle;
}

/**
 * Lightweight Dependency Injection container.
 *
 * Responsibilities:
 * - Register / resolve services
 * - Manage singleton instances
 * - Support transient creation
 * - Prevent duplicate / late registrations
 * - Validate the dependency graph
 * - Freeze after initialization
 *
 * No business logic. Object creation only via registered factories.
 */
export class ApplicationContainer<
  TMap extends object = Record<string, unknown>,
> {
  private readonly registrations = new Map<
    keyof TMap & string,
    Registration<unknown>
  >();
  private readonly singletons = new Map<keyof TMap & string, unknown>();
  private readonly resolving = new Set<keyof TMap & string>();
  private frozen = false;
  private readonly requiredTokens: ReadonlySet<keyof TMap & string>;

  constructor(requiredTokens: readonly (keyof TMap & string)[] = []) {
    this.requiredTokens = new Set(requiredTokens);
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  has(token: keyof TMap & string): boolean {
    return this.registrations.has(token);
  }

  registeredTokens(): readonly (keyof TMap & string)[] {
    return [...this.registrations.keys()];
  }

  /**
   * Register a service factory. Throws on duplicates or if frozen.
   */
  register<K extends keyof TMap & string>(
    token: K,
    factory: ServiceFactory<TMap[K]>,
    options: RegistrationOptions = {},
  ): this {
    if (this.frozen) {
      throw new ContainerFrozenError(
        `Cannot register "${token}" after container freeze`,
      );
    }
    if (this.registrations.has(token)) {
      throw new DuplicateRegistrationError(token);
    }
    if (typeof factory !== "function") {
      throw new InvalidResolutionError(
        `Factory for "${token}" must be a function`,
      );
    }

    this.registrations.set(token, {
      factory: factory as ServiceFactory<unknown>,
      lifecycle: options.lifecycle ?? "singleton",
    });
    return this;
  }

  /**
   * Resolve a registered service. Singletons are cached; transients recreate.
   */
  resolve<K extends keyof TMap & string>(token: K): TMap[K] {
    const registration = this.registrations.get(token);
    if (!registration) {
      throw new MissingRegistrationError(token);
    }

    if (registration.lifecycle === "singleton" && this.singletons.has(token)) {
      return this.singletons.get(token) as TMap[K];
    }

    if (this.resolving.has(token)) {
      const cycle = [...this.resolving, token];
      throw new CircularDependencyError(cycle);
    }

    this.resolving.add(token);
    try {
      const instance = registration.factory();
      if (instance === undefined || instance === null) {
        throw new InvalidResolutionError(
          `Factory for "${token}" returned ${String(instance)}`,
        );
      }
      if (registration.lifecycle === "singleton") {
        this.singletons.set(token, instance);
      }
      return instance as TMap[K];
    } finally {
      this.resolving.delete(token);
    }
  }

  /**
   * Validate registrations: required tokens present, no null factories.
   * Circular deps are detected at resolve time; this eagerly probes required tokens.
   */
  validate(): this {
    const issues: string[] = [];

    for (const token of this.requiredTokens) {
      if (!this.registrations.has(token)) {
        issues.push(`missing required registration: ${token}`);
      }
    }

    for (const [token, registration] of this.registrations) {
      if (typeof registration.factory !== "function") {
        issues.push(`invalid factory for: ${token}`);
      }
    }

    if (issues.length > 0) {
      throw new DependencyValidationError(
        "Dependency graph validation failed",
        issues,
      );
    }

    // Eagerly resolve required tokens to surface circular / invalid factories.
    for (const token of this.requiredTokens) {
      this.resolve(token);
    }

    return this;
  }

  /**
   * Freeze the container — no further registrations allowed.
   */
  freeze(): this {
    this.frozen = true;
    return this;
  }

  /**
   * Clear singleton cache (test / reset support). Registrations remain.
   */
  clearSingletons(): void {
    this.singletons.clear();
  }
}
