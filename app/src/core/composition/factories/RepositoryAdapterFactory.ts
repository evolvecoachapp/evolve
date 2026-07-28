import {
  RepositoryAdapterFactory,
  type RepositoryAdapterBundle,
  type RepositoryAdapterFactoryDeps,
} from "../../../infrastructure/repositories/application";

export interface RepositoryAdapterCompositionFactoryDeps
  extends RepositoryAdapterFactoryDeps {}

/**
 * Composition Root factory for Persistence Contract → SQLite repository adapters.
 */
export const RepositoryAdapterCompositionFactory = {
  create(
    deps: RepositoryAdapterCompositionFactoryDeps = {},
  ): RepositoryAdapterBundle {
    return RepositoryAdapterFactory.create(deps);
  },
} as const;

export type { RepositoryAdapterBundle, RepositoryAdapterFactoryDeps };
