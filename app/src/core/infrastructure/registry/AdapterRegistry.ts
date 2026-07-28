import {
  isAdapterCapability,
  type AdapterCapability,
} from "../contracts/AdapterCapability";
import type { AdapterValidation } from "../contracts/AdapterValidation";
import {
  AdapterRegistrationError,
  AdapterValidationError,
} from "../errors";
import {
  ADAPTER_TOKENS,
  isAdapterToken,
  type AdapterToken,
} from "../adapters/AdapterToken";
import type { AdapterRegistration } from "./AdapterRegistration";
import { createAdapterCapabilities } from "./AdapterCapabilities";
import { createAdapterMetadata } from "./AdapterMetadata";

function freezeRegistration(
  registration: AdapterRegistration,
): AdapterRegistration {
  return Object.freeze({
    token: registration.token,
    name: registration.name,
    version: registration.version,
    capabilities: createAdapterCapabilities(registration.capabilities.items),
    metadata: createAdapterMetadata(registration.metadata),
  });
}

/**
 * In-memory registry of infrastructure adapter contract registrations.
 * Contracts only — no adapter implementations, no I/O.
 */
export class AdapterRegistry {
  private readonly adapters = new Map<AdapterToken, AdapterRegistration>();

  register(registration: AdapterRegistration): void {
    const issues = this.validateRegistration(registration);
    if (issues.length > 0) {
      throw new AdapterValidationError(
        issues,
        `Cannot register adapter contract: ${issues.join(", ")}`,
      );
    }

    if (this.adapters.has(registration.token)) {
      throw new AdapterRegistrationError(
        registration.token,
        `Duplicate adapter registration: ${registration.token}`,
      );
    }

    this.adapters.set(registration.token, freezeRegistration(registration));
  }

  unregister(token: AdapterToken): boolean {
    return this.adapters.delete(token);
  }

  resolve(token: AdapterToken): AdapterRegistration | null {
    return this.adapters.get(token) ?? null;
  }

  has(token: AdapterToken): boolean {
    return this.adapters.has(token);
  }

  list(): readonly AdapterRegistration[] {
    return Object.freeze([...this.adapters.values()]);
  }

  tokens(): readonly AdapterToken[] {
    return Object.freeze([...this.adapters.keys()]);
  }

  capabilities(token: AdapterToken): readonly AdapterCapability[] | null {
    const registration = this.adapters.get(token);
    return registration ? registration.capabilities.items : null;
  }

  clear(): void {
    this.adapters.clear();
  }

  validate(): AdapterValidation {
    const errors: string[] = [];
    const seen = new Set<AdapterToken>();

    for (const registration of this.adapters.values()) {
      if (seen.has(registration.token)) {
        errors.push(`Duplicate adapter: ${registration.token}`);
      }
      seen.add(registration.token);
      errors.push(...this.validateRegistration(registration));
    }

    for (const required of ADAPTER_TOKENS) {
      if (!this.adapters.has(required)) {
        errors.push(`Missing adapter: ${required}`);
      }
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }

  private validateRegistration(registration: AdapterRegistration): string[] {
    const issues: string[] = [];

    if (!registration || typeof registration !== "object") {
      issues.push("Invalid registration: registration missing");
      return issues;
    }

    if (!isAdapterToken(registration.token)) {
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

    if (
      !registration.capabilities ||
      !Array.isArray(registration.capabilities.items)
    ) {
      issues.push(
        `Invalid registration: capabilities missing for ${registration.token}`,
      );
    } else {
      const seenCaps = new Set<string>();
      for (const capability of registration.capabilities.items) {
        if (!isAdapterCapability(capability)) {
          issues.push(
            `Unsupported capability: ${capability} on ${registration.token}`,
          );
        }
        if (seenCaps.has(capability)) {
          issues.push(
            `Duplicate capability: ${capability} on ${registration.token}`,
          );
        }
        seenCaps.add(capability);
      }
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

    return issues;
  }
}

export function createAdapterRegistry(
  registrations: readonly AdapterRegistration[] = [],
): AdapterRegistry {
  const registry = new AdapterRegistry();
  for (const registration of registrations) {
    registry.register(registration);
  }
  return registry;
}

export type { AdapterCapability };
