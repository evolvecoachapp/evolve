import { RuntimeWriteThroughService } from "./RuntimeWriteThroughService";

export interface RuntimeWriteThroughFactoryDeps {
  readonly service?: RuntimeWriteThroughService;
}

/**
 * Composition Root factory for the Runtime Write-Through service facade.
 */
export const RuntimeWriteThroughFactory = {
  create(deps: RuntimeWriteThroughFactoryDeps = {}): RuntimeWriteThroughService {
    return deps.service ?? new RuntimeWriteThroughService();
  },
} as const;
