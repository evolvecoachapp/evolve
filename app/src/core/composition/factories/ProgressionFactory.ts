import { ProgressionEngine } from "../../../features/progression/engine/ProgressionEngine";
import type { ProgressionRepository } from "../../../features/progression/repository";
import { ProgressionService } from "../../../features/progression/services/ProgressionService";
import type { ProgressionStrategy } from "../../../features/progression/strategies/ProgressionStrategy";

export interface ProgressionFactoryDeps {
  readonly repository: ProgressionRepository;
  readonly strategies: readonly ProgressionStrategy[];
}

/**
 * Factory — object creation only for ProgressionService.
 */
export const ProgressionFactory = {
  create(deps: ProgressionFactoryDeps): ProgressionService {
    const engine = new ProgressionEngine(deps.strategies);
    return new ProgressionService(engine, deps.repository);
  },
} as const;
