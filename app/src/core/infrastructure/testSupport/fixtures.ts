import {
  createInfrastructureAdapterRegistry,
  type InfrastructureAdapterRegistry,
} from "../application/InfrastructureAdapterRegistry";

export const FIXED_INFRASTRUCTURE_ADAPTER_TIMESTAMP =
  "2026-07-28T14:00:00.000Z";

export function createTestInfrastructureAdapterRegistry(
  overrides: {
    readonly seedDefaults?: boolean;
  } = {},
): InfrastructureAdapterRegistry {
  return createInfrastructureAdapterRegistry({
    seedDefaults: overrides.seedDefaults !== false,
    clock: () => FIXED_INFRASTRUCTURE_ADAPTER_TIMESTAMP,
  });
}

export function createEmptyInfrastructureAdapterRegistry(): InfrastructureAdapterRegistry {
  return createInfrastructureAdapterRegistry({
    seedDefaults: false,
    clock: () => FIXED_INFRASTRUCTURE_ADAPTER_TIMESTAMP,
  });
}
