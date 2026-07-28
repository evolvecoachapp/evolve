/**
 * Synchronization Adapter Foundation (Sprint 30.4).
 *
 * Application → Synchronization Contract → Synchronization Adapter → Synchronization Engine
 * → Future Remote Provider
 *
 * Deterministic synchronization engine managing state, pending operations,
 * conflict models, and synchronization policies.
 * No networking / HTTP / REST / GraphQL / Supabase / Firebase / PostgreSQL /
 * cloud / sockets / persistence / background services / business logic /
 * synchronization execution.
 */

export * from "./models";
export * from "./registry";
export * from "./engine";
export * from "./operations";
export * from "./queue";
export * from "./state";
export * from "./validation";
export {
  SynchronizationFactory,
  getSynchronization,
  getSynchronizationQueue,
  getSynchronizationState,
  getSynchronizationStatistics,
  validateSynchronization,
  SYNCHRONIZATION_ADAPTER_VERSION,
  type SynchronizationBundle,
  type SynchronizationFactoryDeps,
} from "./application";
