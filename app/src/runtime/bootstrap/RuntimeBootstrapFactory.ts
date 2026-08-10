import { RuntimeBootstrapService } from "./RuntimeBootstrapService";

export interface RuntimeBootstrapFactoryDeps {
  readonly service?: RuntimeBootstrapService;
}

/**
 * Composition Root factory for the Runtime Bootstrap service facade.
 */
export const RuntimeBootstrapFactory = {
  create(deps: RuntimeBootstrapFactoryDeps = {}): RuntimeBootstrapService {
    return deps.service ?? new RuntimeBootstrapService();
  },
} as const;
