/**
 * Infrastructure Adapter Contracts (Sprint 29.4).
 *
 * Domain → Infrastructure Adapter Contracts → Future Adapter Implementations → External Services
 *
 * Interfaces, registries, validation, and immutable errors only.
 * No SQLite / PostgreSQL / Firebase / Supabase / HTTP / REST / GraphQL / SDK /
 * Expo / React Native / network / filesystem / persistence / business logic.
 */

export * from "./contracts";
export * from "./adapters";
export * from "./registry";
export * from "./errors";

export {
  INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION,
  INFRASTRUCTURE_ADAPTER_SCHEMA_VERSION,
  createDefaultAdapterRegistrations,
} from "./application/defaultRegistrations";

export {
  InfrastructureAdapterRegistry,
  createInfrastructureAdapterRegistry,
  type InfrastructureAdapterRegistryDeps,
} from "./application/InfrastructureAdapterRegistry";

export {
  getAdapterRegistry,
  getRegisteredAdapters,
  validateAdapters,
  getAdapterCapabilities,
} from "./application";
