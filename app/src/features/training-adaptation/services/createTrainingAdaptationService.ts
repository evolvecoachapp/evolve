import { TrainingAdaptationEngine } from "../engine/TrainingAdaptationEngine";
import {
  createDefaultAssessments,
  type DefaultAssessments,
} from "../assessments";
import {
  InMemoryTrainingAdaptationRepository,
  type TrainingAdaptationRepository,
  trainingAdaptationRepository,
} from "../repository";
import type { AdaptationStrategy } from "../strategies/AdaptationStrategy";
import { createDefaultStrategies } from "../strategies";
import { TrainingAdaptationService } from "./TrainingAdaptationService";

export interface CreateTrainingAdaptationServiceOptions {
  readonly repository?: TrainingAdaptationRepository;
  readonly assessments?: DefaultAssessments;
  readonly strategies?: readonly AdaptationStrategy[];
}

/**
 * Compose TrainingAdaptationService with in-memory defaults.
 */
export function createTrainingAdaptationService(
  options: CreateTrainingAdaptationServiceOptions = {},
): TrainingAdaptationService {
  const repository = options.repository ?? trainingAdaptationRepository;
  const assessments = options.assessments ?? createDefaultAssessments();
  const strategies = options.strategies ?? createDefaultStrategies();
  const engine = new TrainingAdaptationEngine(assessments, strategies);
  return new TrainingAdaptationService(engine, repository);
}

export function createEmptyTrainingAdaptationService(): TrainingAdaptationService {
  return createTrainingAdaptationService({
    repository: new InMemoryTrainingAdaptationRepository(),
  });
}
