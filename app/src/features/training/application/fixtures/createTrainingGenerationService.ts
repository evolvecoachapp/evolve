import { RuleBasedProgramGenerator } from "../../engine/generators/RuleBasedProgramGenerator";
import type { ProgramGeneratorPlanners } from "../../engine";
import { RuleBasedFrequencyPlanner } from "../../engine/planners/RuleBasedFrequencyPlanner";
import { RuleBasedProgressionPlanner } from "../../engine/planners/RuleBasedProgressionPlanner";
import { RuleBasedSplitPlanner } from "../../engine/planners/RuleBasedSplitPlanner";
import { RuleBasedVolumePlanner } from "../../engine/planners/RuleBasedVolumePlanner";
import { RuleBasedExerciseSelector } from "../../engine/selectors/RuleBasedExerciseSelector";
import { TrainingGenerationService } from "../TrainingGenerationService";

/** Real deterministic planners for fixture / demo composition — never mocked. */
export function createDefaultPlanners(): ProgramGeneratorPlanners {
  return {
    frequencyPlanner: new RuleBasedFrequencyPlanner(),
    splitPlanner: new RuleBasedSplitPlanner(),
    exerciseSelector: new RuleBasedExerciseSelector(),
    volumePlanner: new RuleBasedVolumePlanner(),
    progressionPlanner: new RuleBasedProgressionPlanner(),
  };
}

/**
 * Composition helper for Sprint 12.0.0 fixtures and tests.
 * Wires the application service to the deterministic engine implementations
 * without embedding that wiring inside `TrainingGenerationService` itself.
 */
export function createTrainingGenerationService(): TrainingGenerationService {
  return new TrainingGenerationService(new RuleBasedProgramGenerator(), createDefaultPlanners());
}
