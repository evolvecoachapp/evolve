/**
 * Repository Adapter Layer (Sprint 30.2).
 *
 * Domain → Persistence Contracts → Repository Adapters → SQLite Repositories → SQLite Engine
 *
 * Adapters implement Persistence Contracts and delegate only to SQLite repositories.
 * No domain logic. No AI. No networking. No cloud. No auth. No cache. No sync.
 */

export * from "./adapters";
export * from "./registry";
export {
  RepositoryAdapterFactory,
  getRepositoryAdapters,
  getRepositoryAdapter,
  validateRepositoryAdapters,
  REPOSITORY_ADAPTER_VERSION,
  type RepositoryAdapterBundle,
  type RepositoryAdapterFactoryDeps,
  type RepositoryAdapterValidation,
} from "./application";
export { validateRepositoryAdapterBundle } from "./validation";
