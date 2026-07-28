import {
  SynchronizationFactory,
  type SynchronizationBundle,
  type SynchronizationFactoryDeps,
} from "../../../infrastructure/synchronization/application";

export interface SynchronizationCompositionFactoryDeps
  extends SynchronizationFactoryDeps {}

/**
 * Composition Root factory for the Synchronization Adapter Foundation.
 */
export const SynchronizationCompositionFactory = {
  create(
    deps: SynchronizationCompositionFactoryDeps = {},
  ): SynchronizationBundle {
    return SynchronizationFactory.create(deps);
  },
} as const;

export type { SynchronizationBundle, SynchronizationFactoryDeps };
