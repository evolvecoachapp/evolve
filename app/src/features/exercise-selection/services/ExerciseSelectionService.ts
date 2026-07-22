import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import type { SelectionExplanation } from "../models/SelectionExplanation";
import type { ExerciseSelectionEngine } from "../engine/ExerciseSelectionEngine";
import type { SelectionRepository } from "../repository/SelectionRepository";

/**
 * Coordinates the selection engine and optional result cache.
 */
export class ExerciseSelectionService {
  constructor(
    private readonly engine: ExerciseSelectionEngine,
    private readonly repository: SelectionRepository,
  ) {}

  async selectExercises(
    request: ExerciseSelectionRequest,
  ): Promise<ExerciseSelectionResult> {
    const result = await this.engine.select(request);
    return this.repository.save(result);
  }

  async previewExerciseCandidates(
    request: ExerciseSelectionRequest,
  ): Promise<ExerciseSelectionResult> {
    const result = await this.engine.preview(request);
    return this.repository.save(result);
  }

  async explainSelection(
    requestIdOrResult: string | ExerciseSelectionResult,
  ): Promise<readonly SelectionExplanation[]> {
    if (typeof requestIdOrResult !== "string") {
      return this.engine.explain(requestIdOrResult);
    }

    const cached = await this.repository.load(requestIdOrResult);
    if (!cached) {
      return Object.freeze([]);
    }
    return this.engine.explain(cached);
  }

  async loadCached(requestId: string): Promise<ExerciseSelectionResult | null> {
    return this.repository.load(requestId);
  }
}
