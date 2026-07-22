import type { ProgrammingEngine } from "../engine/ProgrammingEngine";
import type { ProgrammingExplanation } from "../models/ProgrammingExplanation";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import type { ProgrammingRepository } from "../repository/ProgrammingRepository";

/**
 * Coordinates the programming engine and optional result cache.
 */
export class ProgrammingService {
  constructor(
    private readonly engine: ProgrammingEngine,
    private readonly repository: ProgrammingRepository,
  ) {}

  async programExercises(
    request: ProgrammingRequest,
  ): Promise<ProgrammingResult> {
    const result = await this.engine.program(request);
    return this.repository.save(result);
  }

  async previewProgramming(
    request: ProgrammingRequest,
  ): Promise<ProgrammingResult> {
    const result = await this.engine.preview(request);
    return this.repository.save(result);
  }

  async explainProgramming(
    requestIdOrResult: string | ProgrammingResult,
  ): Promise<readonly ProgrammingExplanation[]> {
    if (typeof requestIdOrResult !== "string") {
      return this.engine.explain(requestIdOrResult);
    }

    const cached = await this.repository.load(requestIdOrResult);
    if (!cached) {
      return Object.freeze([]);
    }
    return this.engine.explain(cached);
  }

  async loadCached(requestId: string): Promise<ProgrammingResult | null> {
    return this.repository.load(requestId);
  }
}
