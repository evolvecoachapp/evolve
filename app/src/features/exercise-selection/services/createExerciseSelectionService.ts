import {
  createEmptyExerciseKnowledgeService,
  createExerciseKnowledgeService,
  type ExerciseKnowledgeService,
} from "../../exercise-kb/services";
import { ExerciseSelectionEngine } from "../engine/ExerciseSelectionEngine";
import {
  InMemorySelectionRepository,
  type SelectionRepository,
  selectionRepository,
} from "../repository";
import type { ExerciseRoleSelector } from "../selectors/ExerciseRoleSelector";
import { createDefaultSelectors } from "../selectors";
import type { SelectionStrategy } from "../strategies/SelectionStrategy";
import { createDefaultStrategies } from "../strategies";
import { ExerciseSelectionService } from "./ExerciseSelectionService";

export interface CreateExerciseSelectionServiceOptions {
  readonly knowledgeService?: ExerciseKnowledgeService;
  readonly repository?: SelectionRepository;
  readonly strategies?: readonly SelectionStrategy[];
  readonly selectors?: readonly ExerciseRoleSelector[];
}

/**
 * Compose ExerciseSelectionService with in-memory defaults.
 */
export function createExerciseSelectionService(
  options: CreateExerciseSelectionServiceOptions = {},
): ExerciseSelectionService {
  const knowledgeService =
    options.knowledgeService ?? createExerciseKnowledgeService();
  const repository = options.repository ?? selectionRepository;
  const strategies = options.strategies ?? createDefaultStrategies();
  const selectors = options.selectors ?? createDefaultSelectors();
  const engine = new ExerciseSelectionEngine(
    knowledgeService,
    strategies,
    selectors,
  );
  return new ExerciseSelectionService(engine, repository);
}

export function createEmptyExerciseSelectionService(): ExerciseSelectionService {
  return createExerciseSelectionService({
    knowledgeService: createEmptyExerciseKnowledgeService(),
    repository: new InMemorySelectionRepository(),
  });
}
