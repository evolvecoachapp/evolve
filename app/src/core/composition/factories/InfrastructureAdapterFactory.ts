import {
  createInfrastructureAdapterRegistry,
  type InfrastructureAdapterRegistry,
  type InfrastructureAdapterRegistryDeps,
} from "../../infrastructure/application/InfrastructureAdapterRegistry";

export interface InfrastructureAdapterFactoryDeps
  extends InfrastructureAdapterRegistryDeps {
  readonly registry?: InfrastructureAdapterRegistry;
}

export const InfrastructureAdapterFactory = {
  create(
    deps: InfrastructureAdapterFactoryDeps = {},
  ): InfrastructureAdapterRegistry {
    return deps.registry ?? createInfrastructureAdapterRegistry(deps);
  },
} as const;
