import type { WorkoutAssemblyEngine } from "../engine/WorkoutAssemblyEngine";
import type { WorkoutAssemblyExplanation } from "../models/WorkoutAssemblyExplanation";
import type { WorkoutAssemblyRequest } from "../models/WorkoutAssemblyRequest";
import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import type { WorkoutAssemblyRepository } from "../repository/WorkoutAssemblyRepository";

/**
 * Coordinates the workout assembly engine and optional result cache.
 */
export class WorkoutAssemblyService {
  constructor(
    private readonly engine: WorkoutAssemblyEngine,
    private readonly repository: WorkoutAssemblyRepository,
  ) {}

  async assembleWorkout(
    request: WorkoutAssemblyRequest,
  ): Promise<WorkoutAssemblyResult> {
    const result = await this.engine.assemble(request);
    return this.repository.save(result);
  }

  async previewWorkout(
    request: WorkoutAssemblyRequest,
  ): Promise<WorkoutAssemblyResult> {
    const result = await this.engine.preview(request);
    return this.repository.save(result);
  }

  async explainWorkout(
    requestIdOrResult: string | WorkoutAssemblyResult,
  ): Promise<readonly WorkoutAssemblyExplanation[]> {
    if (typeof requestIdOrResult !== "string") {
      return this.engine.explain(requestIdOrResult);
    }

    const cached = await this.repository.load(requestIdOrResult);
    if (!cached) {
      return Object.freeze([]);
    }
    return this.engine.explain(cached);
  }

  async loadCached(requestId: string): Promise<WorkoutAssemblyResult | null> {
    return this.repository.load(requestId);
  }

  async listCachedResults(): Promise<readonly WorkoutAssemblyResult[]> {
    return this.repository.list();
  }
}
