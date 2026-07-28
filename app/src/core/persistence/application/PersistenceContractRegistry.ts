import type { PersistenceContractsView } from "../contracts/PersistenceContractsView";
import type { PersistenceValidation } from "../contracts/PersistenceValidation";
import {
  createDefaultRepositoryDescriptors,
  createDefaultStorageDescriptors,
  PERSISTENCE_CONTRACT_VERSION,
  PERSISTENCE_SCHEMA_VERSION,
} from "./defaultDescriptors";
import {
  createRepositoryRegistry,
  type RepositoryRegistry,
} from "./RepositoryRegistry";
import {
  createStorageContractRegistry,
  type StorageContractRegistry,
} from "./StorageContractRegistry";

export interface PersistenceContractRegistryDeps {
  readonly repositories?: RepositoryRegistry;
  readonly storage?: StorageContractRegistry;
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly seedDefaults?: boolean;
}

/**
 * Aggregates repository and storage contract registries.
 * Contracts only — no adapters, no storage.
 */
export class PersistenceContractRegistry {
  readonly repositories: RepositoryRegistry;
  readonly storage: StorageContractRegistry;
  private readonly clock: () => string;
  private readonly version: string;
  private readonly schemaVersion: string;

  constructor(deps: PersistenceContractRegistryDeps = {}) {
    const seedDefaults = deps.seedDefaults !== false;
    this.repositories =
      deps.repositories ??
      createRepositoryRegistry(
        seedDefaults ? createDefaultRepositoryDescriptors() : [],
      );
    this.storage =
      deps.storage ??
      createStorageContractRegistry(
        seedDefaults ? createDefaultStorageDescriptors() : [],
      );
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.version = deps.version ?? PERSISTENCE_CONTRACT_VERSION;
    this.schemaVersion = deps.schemaVersion ?? PERSISTENCE_SCHEMA_VERSION;
  }

  getContracts(): PersistenceContractsView {
    return Object.freeze({
      version: this.version,
      schemaVersion: this.schemaVersion,
      repositories: this.repositories.list(),
      storagePorts: this.storage.list(),
      generatedAt: this.clock(),
    });
  }

  getRepositoryRegistry(): RepositoryRegistry {
    return this.repositories;
  }

  getStorageContractRegistry(): StorageContractRegistry {
    return this.storage;
  }

  validate(): PersistenceValidation {
    const repoValidation = this.repositories.validate();
    const storageValidation = this.storage.validate();
    const errors = Object.freeze([
      ...repoValidation.errors,
      ...storageValidation.errors,
    ]);

    return Object.freeze({
      valid: errors.length === 0,
      errors,
    });
  }
}

export function createPersistenceContractRegistry(
  deps: PersistenceContractRegistryDeps = {},
): PersistenceContractRegistry {
  return new PersistenceContractRegistry(deps);
}
