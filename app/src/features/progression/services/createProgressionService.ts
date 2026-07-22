import { ProgressionEngine } from "../engine/ProgressionEngine";
import {
  InMemoryProgressionRepository,
  type ProgressionRepository,
  progressionRepository,
} from "../repository";
import type { ProgressionStrategy } from "../strategies/ProgressionStrategy";
import { createDefaultStrategies } from "../strategies";
import { ProgressionService } from "./ProgressionService";

export interface CreateProgressionServiceOptions {
  readonly repository?: ProgressionRepository;
  readonly strategies?: readonly ProgressionStrategy[];
}

/**
 * Compose ProgressionService with in-memory defaults.
 */
export function createProgressionService(
  options: CreateProgressionServiceOptions = {},
): ProgressionService {
  const repository = options.repository ?? progressionRepository;
  const strategies = options.strategies ?? createDefaultStrategies();
  const engine = new ProgressionEngine(strategies);
  return new ProgressionService(engine, repository);
}

export function createEmptyProgressionService(): ProgressionService {
  return createProgressionService({
    repository: new InMemoryProgressionRepository(),
  });
}
