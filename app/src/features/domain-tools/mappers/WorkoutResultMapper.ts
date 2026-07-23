import type { PerformanceEngineResult } from "../../performance-engine/models/PerformanceEngineResult";
import type { WorkoutGenerationResult } from "../../program-generation/models/WorkoutGenerationResult";
import type { ToolOutput } from "../../tool-calling/models/ToolOutput";
import { freezePayload } from "../utils/freezeObjects";
import {
  validateOutputMapping,
  type OutputMappingValidationCode,
} from "../validators/validateOutputMapping";

export type WorkoutDomainResult =
  | WorkoutGenerationResult
  | PerformanceEngineResult;

export type WorkoutResultMapResult =
  | { readonly ok: true; readonly output: ToolOutput }
  | {
      readonly ok: false;
      readonly issues: readonly OutputMappingValidationCode[];
    };

/**
 * Map workout domain results → ToolOutput.
 * No domain logic.
 */
export class WorkoutResultMapper {
  static map(result: WorkoutDomainResult): WorkoutResultMapResult {
    const issues = validateOutputMapping(result);
    if (issues.length > 0) {
      return { ok: false, issues };
    }
    return {
      ok: true,
      output: Object.freeze({
        data: freezePayload(result),
      }),
    };
  }
}
