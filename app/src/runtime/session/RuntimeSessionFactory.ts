import { RuntimeSessionService } from "./RuntimeSessionService";

export interface RuntimeSessionFactoryDeps {
  readonly service?: RuntimeSessionService;
}

/**
 * Composition Root factory for the Runtime Session service facade.
 */
export const RuntimeSessionFactory = {
  create(deps: RuntimeSessionFactoryDeps = {}): RuntimeSessionService {
    return deps.service ?? new RuntimeSessionService();
  },
} as const;
