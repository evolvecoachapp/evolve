import { ProgrammingEngine } from "../engine/ProgrammingEngine";
import {
  InMemoryProgrammingRepository,
  type ProgrammingRepository,
  programmingRepository,
} from "../repository";
import type { ProgrammingStrategy } from "../strategies/ProgrammingStrategy";
import { createDefaultStrategies } from "../strategies";
import { ProgrammingService } from "./ProgrammingService";

export interface CreateProgrammingServiceOptions {
  readonly repository?: ProgrammingRepository;
  readonly strategies?: readonly ProgrammingStrategy[];
}

/**
 * Compose ProgrammingService with in-memory defaults.
 */
export function createProgrammingService(
  options: CreateProgrammingServiceOptions = {},
): ProgrammingService {
  const repository = options.repository ?? programmingRepository;
  const strategies = options.strategies ?? createDefaultStrategies();
  const engine = new ProgrammingEngine(strategies);
  return new ProgrammingService(engine, repository);
}

export function createEmptyProgrammingService(): ProgrammingService {
  return createProgrammingService({
    repository: new InMemoryProgrammingRepository(),
  });
}
