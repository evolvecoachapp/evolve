/**
 * Persistence Contract Foundation (Sprint 29.3).
 *
 * Domain → Persistence Contracts → Future Adapters → Storage Technologies
 *
 * Interfaces, registries, validation, and immutable errors only.
 * No SQLite / PostgreSQL / Supabase / AsyncStorage / IndexedDB / filesystem /
 * network / serialization / adapters / DI framework / business logic.
 */

export * from "./contracts";
export * from "./repositories";
export * from "./ports";
export * from "./errors";

export {
  PERSISTENCE_CONTRACT_VERSION,
  PERSISTENCE_SCHEMA_VERSION,
  createDefaultRepositoryDescriptors,
  createDefaultStorageDescriptors,
} from "./application/defaultDescriptors";

export {
  RepositoryRegistry,
  createRepositoryRegistry,
} from "./application/RepositoryRegistry";

export {
  StorageContractRegistry,
  createStorageContractRegistry,
} from "./application/StorageContractRegistry";

export {
  PersistenceContractRegistry,
  createPersistenceContractRegistry,
  type PersistenceContractRegistryDeps,
} from "./application/PersistenceContractRegistry";

export {
  getPersistenceContracts,
  getRepositoryRegistry,
  validatePersistenceContracts,
} from "./application";
