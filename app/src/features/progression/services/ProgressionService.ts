import type { ProgressionEngine } from "../engine/ProgressionEngine";
import type { ProgressionExplanation } from "../models/ProgressionExplanation";
import type { ProgressionPlan } from "../models/ProgressionPlan";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import type { ProgressionRepository } from "../repository/ProgressionRepository";

/**
 * Coordinates the progression engine and optional plan cache.
 */
export class ProgressionService {
  constructor(
    private readonly engine: ProgressionEngine,
    private readonly repository: ProgressionRepository,
  ) {}

  async generateProgression(
    request: ProgressionRequest,
  ): Promise<ProgressionPlan> {
    const plan = await this.engine.generate(request);
    return this.repository.save(plan);
  }

  async previewProgression(
    request: ProgressionRequest,
  ): Promise<ProgressionPlan> {
    const plan = await this.engine.preview(request);
    return this.repository.save(plan);
  }

  async explainProgression(
    requestIdOrPlan: string | ProgressionPlan,
  ): Promise<readonly ProgressionExplanation[]> {
    if (typeof requestIdOrPlan !== "string") {
      return this.engine.explain(requestIdOrPlan);
    }

    const cached = await this.repository.load(requestIdOrPlan);
    if (!cached) {
      return Object.freeze([]);
    }
    return this.engine.explain(cached);
  }

  async loadCached(requestId: string): Promise<ProgressionPlan | null> {
    return this.repository.load(requestId);
  }
}
