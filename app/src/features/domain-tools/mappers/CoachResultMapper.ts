import type { CoachEngineResult } from "../../coach-intelligence/models/CoachEngineResult";
import type { CoachingContextSummary } from "../../coach-intelligence/models/CoachingContextSummary";
import type { InsightEngineResult } from "../../insight-engine/models/InsightEngineResult";
import type { ToolOutput } from "../../tool-calling/models/ToolOutput";
import { freezePayload } from "../utils/freezeObjects";
import {
  validateOutputMapping,
  type OutputMappingValidationCode,
} from "../validators/validateOutputMapping";

export type CoachDomainResult =
  | CoachEngineResult
  | InsightEngineResult
  | CoachingContextSummary;

export type CoachResultMapResult =
  | { readonly ok: true; readonly output: ToolOutput }
  | {
      readonly ok: false;
      readonly issues: readonly OutputMappingValidationCode[];
    };

/**
 * Map coach / insight domain results → ToolOutput.
 */
export class CoachResultMapper {
  static map(result: CoachDomainResult): CoachResultMapResult {
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
