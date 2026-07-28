import {
  isPersistenceCapability,
} from "../contracts/PersistenceCapability";
import type { StorageContractDescriptor } from "../contracts/StorageContractDescriptor";
import type { PersistenceValidation } from "../contracts/PersistenceValidation";
import { ContractViolationError } from "../errors";
import { ValidationError } from "../errors";
import {
  isStoragePortToken,
  type StoragePortToken,
  STORAGE_PORT_TOKENS,
} from "../ports/StoragePortToken";

function freezeDescriptor(
  descriptor: StorageContractDescriptor,
): StorageContractDescriptor {
  return Object.freeze({
    token: descriptor.token,
    name: descriptor.name,
    version: descriptor.version,
    capabilities: Object.freeze([...descriptor.capabilities]),
    metadata: Object.freeze({ ...descriptor.metadata }),
  });
}

/**
 * In-memory registry of storage port contract descriptors.
 * Contracts only — no adapters, no storage.
 */
export class StorageContractRegistry {
  private readonly ports = new Map<
    StoragePortToken,
    StorageContractDescriptor
  >();

  register(descriptor: StorageContractDescriptor): void {
    const issues = this.validateDescriptor(descriptor);
    if (issues.length > 0) {
      throw new ValidationError(
        issues,
        `Cannot register storage contract: ${issues.join(", ")}`,
      );
    }

    if (this.ports.has(descriptor.token)) {
      throw new ContractViolationError(
        descriptor.token,
        `Duplicate storage contract registration: ${descriptor.token}`,
      );
    }

    this.ports.set(descriptor.token, freezeDescriptor(descriptor));
  }

  unregister(token: StoragePortToken): boolean {
    return this.ports.delete(token);
  }

  resolve(token: StoragePortToken): StorageContractDescriptor | null {
    return this.ports.get(token) ?? null;
  }

  has(token: StoragePortToken): boolean {
    return this.ports.has(token);
  }

  list(): readonly StorageContractDescriptor[] {
    return Object.freeze([...this.ports.values()]);
  }

  tokens(): readonly StoragePortToken[] {
    return Object.freeze([...this.ports.keys()]);
  }

  clear(): void {
    this.ports.clear();
  }

  validate(): PersistenceValidation {
    const errors: string[] = [];
    const seen = new Set<StoragePortToken>();

    for (const descriptor of this.ports.values()) {
      if (seen.has(descriptor.token)) {
        errors.push(`Duplicate storage contract: ${descriptor.token}`);
      }
      seen.add(descriptor.token);
      errors.push(...this.validateDescriptor(descriptor));
    }

    for (const required of STORAGE_PORT_TOKENS) {
      if (!this.ports.has(required)) {
        errors.push(`Missing storage contract: ${required}`);
      }
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }

  private validateDescriptor(descriptor: StorageContractDescriptor): string[] {
    const issues: string[] = [];

    if (!descriptor || typeof descriptor !== "object") {
      issues.push("Invalid registration: storage descriptor missing");
      return issues;
    }

    if (!isStoragePortToken(descriptor.token)) {
      issues.push(`Invalid registration: unknown storage port token`);
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

export function createStorageContractRegistry(
  descriptors: readonly StorageContractDescriptor[] = [],
): StorageContractRegistry {
  const registry = new StorageContractRegistry();
  for (const descriptor of descriptors) {
    registry.register(descriptor);
  }
  return registry;
}
