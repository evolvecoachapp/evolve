/**
 * Ordered phases recorded when the runtime bootstrap completes successfully.
 */
export type RuntimeInitializationPhase =
  | "composition_root_created"
  | "service_registry_validated"
  | "runtime_frozen";

export const RUNTIME_INITIALIZATION_PHASES = [
  "composition_root_created",
  "service_registry_validated",
  "runtime_frozen",
] as const satisfies readonly RuntimeInitializationPhase[];
