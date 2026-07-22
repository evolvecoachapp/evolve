import type { DefaultAssessments } from "../../../features/training-adaptation/assessments";
import { TrainingAdaptationEngine } from "../../../features/training-adaptation/engine/TrainingAdaptationEngine";
import type { TrainingAdaptationRepository } from "../../../features/training-adaptation/repository";
import { TrainingAdaptationService } from "../../../features/training-adaptation/services/TrainingAdaptationService";
import type { AdaptationStrategy } from "../../../features/training-adaptation/strategies/AdaptationStrategy";

export interface TrainingAdaptationFactoryDeps {
  readonly repository: TrainingAdaptationRepository;
  readonly assessments: DefaultAssessments;
  readonly strategies: readonly AdaptationStrategy[];
}

/**
 * Factory — object creation only for TrainingAdaptationService.
 */
export const TrainingAdaptationFactory = {
  create(deps: TrainingAdaptationFactoryDeps): TrainingAdaptationService {
    const engine = new TrainingAdaptationEngine(
      deps.assessments,
      deps.strategies,
    );
    return new TrainingAdaptationService(engine, deps.repository);
  },
} as const;
