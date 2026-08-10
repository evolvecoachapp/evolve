import { HydrationService } from "./HydrationService";

export interface HydrationFactoryDeps {
  readonly service?: HydrationService;
}

/**
 * Composition Root factory for the Repository Hydration service facade.
 */
export const HydrationFactory = {
  create(deps: HydrationFactoryDeps = {}): HydrationService {
    return deps.service ?? new HydrationService();
  },
} as const;

/** Composition Root registration alias. */
export const RepositoryHydrationFactory = HydrationFactory;

export type RepositoryHydrationFactoryDeps = HydrationFactoryDeps;
