import { createDefaultSelectors } from "../../../features/exercise-selection/selectors";
import type { ExerciseRoleSelector } from "../../../features/exercise-selection/selectors/ExerciseRoleSelector";
import { createDefaultStrategies as createDefaultSelectionStrategies } from "../../../features/exercise-selection/strategies";
import type { SelectionStrategy } from "../../../features/exercise-selection/strategies/SelectionStrategy";
import { createDefaultStrategies as createDefaultProgrammingStrategies } from "../../../features/programming/strategies";
import type { ProgrammingStrategy } from "../../../features/programming/strategies/ProgrammingStrategy";
import { createDefaultStrategies as createDefaultProgressionStrategies } from "../../../features/progression/strategies";
import type { ProgressionStrategy } from "../../../features/progression/strategies/ProgressionStrategy";
import {
  createDefaultAssessments,
  type DefaultAssessments,
} from "../../../features/training-adaptation/assessments";
import { createDefaultStrategies as createDefaultAdaptationStrategies } from "../../../features/training-adaptation/strategies";
import type { AdaptationStrategy } from "../../../features/training-adaptation/strategies/AdaptationStrategy";
import type { CompositionConfiguration } from "../configuration/CompositionConfiguration";

/**
 * Provides default in-memory strategies / assessments for engines.
 * No business logic — delegates to existing feature defaults.
 */
export class StrategyProvider {
  constructor(
    private readonly configuration: CompositionConfiguration,
  ) {
    void this.configuration; // locked to default strategies for this sprint
  }

  selectionStrategies(): readonly SelectionStrategy[] {
    return createDefaultSelectionStrategies();
  }

  selectionSelectors(): readonly ExerciseRoleSelector[] {
    return createDefaultSelectors();
  }

  programmingStrategies(): readonly ProgrammingStrategy[] {
    return createDefaultProgrammingStrategies();
  }

  progressionStrategies(): readonly ProgressionStrategy[] {
    return createDefaultProgressionStrategies();
  }

  adaptationStrategies(): readonly AdaptationStrategy[] {
    return createDefaultAdaptationStrategies();
  }

  adaptationAssessments(): DefaultAssessments {
    return createDefaultAssessments();
  }
}
