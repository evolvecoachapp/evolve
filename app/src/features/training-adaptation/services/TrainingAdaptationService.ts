import type { TrainingAdaptationEngine } from "../engine/TrainingAdaptationEngine";
import type { AdaptationExplanation } from "../models/AdaptationExplanation";
import type { TrainingAdaptationRequest } from "../models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import type { TrainingAdaptationRepository } from "../repository/TrainingAdaptationRepository";

/**
 * Coordinates the training adaptation engine and optional result cache.
 */
export class TrainingAdaptationService {
  constructor(
    private readonly engine: TrainingAdaptationEngine,
    private readonly repository: TrainingAdaptationRepository,
  ) {}

  async evaluateTrainingReadiness(
    request: TrainingAdaptationRequest,
  ): Promise<TrainingAdaptationResult> {
    const result = await this.engine.evaluate(request);
    return this.repository.save(result);
  }

  async previewAdaptations(
    request: TrainingAdaptationRequest,
  ): Promise<TrainingAdaptationResult> {
    const result = await this.engine.preview(request);
    return this.repository.save(result);
  }

  async explainAdaptations(
    requestIdOrResult: string | TrainingAdaptationResult,
  ): Promise<readonly AdaptationExplanation[]> {
    if (typeof requestIdOrResult !== "string") {
      return this.engine.explain(requestIdOrResult);
    }

    const cached = await this.repository.load(requestIdOrResult);
    if (!cached) {
      return Object.freeze([]);
    }
    return this.engine.explain(cached);
  }

  async loadCached(
    requestId: string,
  ): Promise<TrainingAdaptationResult | null> {
    return this.repository.load(requestId);
  }
}
