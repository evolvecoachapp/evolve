import {
  isPersistenceCapability,
  type PersistenceCapability,
} from "../contracts/PersistenceCapability";
import type { RepositoryContractDescriptor } from "../contracts/RepositoryContractDescriptor";
import type { PersistenceValidation } from "../contracts/PersistenceValidation";
import { ContractViolationError } from "../errors";
import { ValidationError } from "../errors";
import {
  isRepositoryToken,
  type RepositoryToken,
  REPOSITORY_TOKENS,
} from "../repositories/RepositoryToken";

function freezeDescriptor(
  descriptor: RepositoryContractDescriptor,
): RepositoryContractDescriptor {
  return Object.freeze({
    token: descriptor.token,
    name: descriptor.name,
    version: descriptor.version,
    capabilities: Object.freeze([...descriptor.capabilities]),
    metadata: Object.freeze({ ...descriptor.metadata }),
  });
}

/**
 * In-memory registry of repository contract descriptors.
 * Contracts only — no adapters, no storage.
 */
export class RepositoryRegistry {
  private readonly repositories = new Map<
    RepositoryToken,
    RepositoryContractDescriptor
  >();

  register(descriptor: RepositoryContractDescriptor): void {
    const issues = this.validateDescriptor(descriptor);
    if (issues.length > 0) {
      throw new ValidationError(
        issues,
        `Cannot register repository contract: ${issues.join(", ")}`,
      );
    }

    if (this.repositories.has(descriptor.token)) {
      throw new ContractViolationError(
        descriptor.token,
        `Duplicate repository registration: ${descriptor.token}`,
      );
    }

    this.repositories.set(descriptor.token, freezeDescriptor(descriptor));
  }

  unregister(token: RepositoryToken): boolean {
    return this.repositories.delete(token);
  }

  resolve(token: RepositoryToken): RepositoryContractDescriptor | null {
    return this.repositories.get(token) ?? null;
  }

  has(token: RepositoryToken): boolean {
    return this.repositories.has(token);
  }

  list(): readonly RepositoryContractDescriptor[] {
    return Object.freeze([...this.repositories.values()]);
  }

  tokens(): readonly RepositoryToken[] {
    return Object.freeze([...this.repositories.keys()]);
  }

  clear(): void {
    this.repositories.clear();
  }

  validate(): PersistenceValidation {
    const errors: string[] = [];
    const seen = new Set<RepositoryToken>();

    for (const descriptor of this.repositories.values()) {
      if (seen.has(descriptor.token)) {
        errors.push(`Duplicate repository: ${descriptor.token}`);
      }
      seen.add(descriptor.token);
      errors.push(...this.validateDescriptor(descriptor));
    }

    for (const required of REPOSITORY_TOKENS) {
      if (!this.repositories.has(required)) {
        errors.push(`Missing repository contract: ${required}`);
      }
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }

  private validateDescriptor(
    descriptor: RepositoryContractDescriptor,
  ): string[] {
    const issues: string[] = [];

    if (!descriptor || typeof descriptor !== "object") {
      issues.push("Invalid registration: descriptor missing");
      return issues;
    }

    if (!isRepositoryToken(descriptor.token)) {
      issues.push(`Invalid registration: unknown repository token`);
    }

    if (
      typeof descriptor.name !== "string" ||
      descriptor.name.trim().length === 0
    ) {
      issues.push(`Invalid metadata: name required for ${descriptor.token}`);
    }

    if (
      typeof descriptor.version !== "string" ||
      descriptor.version.trim().length === 0
    ) {
      issues.push(`Invalid metadata: version required for ${descriptor.token}`);
    }

    if (!Array.isArray(descriptor.capabilities)) {
      issues.push(
        `Invalid registration: capabilities missing for ${descriptor.token}`,
      );
    } else {
      const seenCaps = new Set<string>();
      for (const capability of descriptor.capabilities) {
        if (!isPersistenceCapability(capability)) {
          issues.push(
            `Unsupported capability: ${capability} on ${descriptor.token}`,
          );
        }
        if (seenCaps.has(capability)) {
          issues.push(
            `Duplicate capability: ${capability} on ${descriptor.token}`,
          );
        }
        seenCaps.add(capability);
      }
    }

    if (
      !descriptor.metadata ||
      typeof descriptor.metadata !== "object" ||
      Array.isArray(descriptor.metadata)
    ) {
      issues.push(
        `Invalid metadata: metadata object required for ${descriptor.token}`,
      );
    }

    return issues;
  }
}

export function createRepositoryRegistry(
  descriptors: readonly RepositoryContractDescriptor[] = [],
): RepositoryRegistry {
  const registry = new RepositoryRegistry();
  for (const descriptor of descriptors) {
    registry.register(descriptor);
  }
  return registry;
}

export type { PersistenceCapability };
