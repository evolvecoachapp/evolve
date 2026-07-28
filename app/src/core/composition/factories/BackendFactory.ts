import {
  BackendFactory,
  type BackendBundle,
  type BackendFactoryDeps,
} from "../../../infrastructure/backend/application";

export interface BackendCompositionFactoryDeps extends BackendFactoryDeps {}

/**
 * Composition Root factory for the Backend API Adapter Foundation.
 */
export const BackendCompositionFactory = {
  create(deps: BackendCompositionFactoryDeps = {}): BackendBundle {
    return BackendFactory.create(deps);
  },
} as const;

export type { BackendBundle, BackendFactoryDeps };
