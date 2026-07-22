import { ProgrammingEngine } from "../../../features/programming/engine/ProgrammingEngine";
import type { ProgrammingRepository } from "../../../features/programming/repository";
import { ProgrammingService } from "../../../features/programming/services/ProgrammingService";
import type { ProgrammingStrategy } from "../../../features/programming/strategies/ProgrammingStrategy";

export interface ProgrammingFactoryDeps {
  readonly repository: ProgrammingRepository;
  readonly strategies: readonly ProgrammingStrategy[];
}

/**
 * Factory — object creation only for ProgrammingService.
 */
export const ProgrammingFactory = {
  create(deps: ProgrammingFactoryDeps): ProgrammingService {
    const engine = new ProgrammingEngine(deps.strategies);
    return new ProgrammingService(engine, deps.repository);
  },
} as const;
