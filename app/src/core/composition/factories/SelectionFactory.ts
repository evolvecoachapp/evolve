import type { ExerciseKnowledgeService } from "../../../features/exercise-kb/services";
import { createExerciseKnowledgeService } from "../../../features/exercise-kb/services";
import { ExerciseSelectionEngine } from "../../../features/exercise-selection/engine/ExerciseSelectionEngine";
import type { SelectionRepository } from "../../../features/exercise-selection/repository";
import type { ExerciseRoleSelector } from "../../../features/exercise-selection/selectors/ExerciseRoleSelector";
import { ExerciseSelectionService } from "../../../features/exercise-selection/services/ExerciseSelectionService";
import type { SelectionStrategy } from "../../../features/exercise-selection/strategies/SelectionStrategy";

export interface SelectionFactoryDeps {
  readonly repository: SelectionRepository;
  readonly strategies: readonly SelectionStrategy[];
  readonly selectors: readonly ExerciseRoleSelector[];
  readonly knowledgeService?: ExerciseKnowledgeService;
}

/**
 * Factory — object creation only for ExerciseSelectionService.
 */
export const SelectionFactory = {
  create(deps: SelectionFactoryDeps): ExerciseSelectionService {
    const knowledgeService =
      deps.knowledgeService ?? createExerciseKnowledgeService();
    const engine = new ExerciseSelectionEngine(
      knowledgeService,
      deps.strategies,
      deps.selectors,
    );
    return new ExerciseSelectionService(engine, deps.repository);
  },
} as const;

/** Alias matching sprint naming. */
export const ExerciseSelectionFactory = SelectionFactory;
