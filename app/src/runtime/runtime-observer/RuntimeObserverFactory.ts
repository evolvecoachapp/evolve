import { RuntimeObserverService } from "./RuntimeObserverService";

export interface RuntimeObserverFactoryDeps {
  readonly service?: RuntimeObserverService;
}

/**
 * Composition Root factory for the Runtime Change Observer service facade.
 */
export const RuntimeObserverFactory = {
  create(deps: RuntimeObserverFactoryDeps = {}): RuntimeObserverService {
    return deps.service ?? new RuntimeObserverService();
  },
} as const;
