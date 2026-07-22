/**
 * Service instance lifecycle managed by ApplicationContainer.
 *
 * - singleton: one shared instance per container (created on first resolve)
 * - transient: new instance on every resolve
 */
export type ServiceLifecycle = "singleton" | "transient";
