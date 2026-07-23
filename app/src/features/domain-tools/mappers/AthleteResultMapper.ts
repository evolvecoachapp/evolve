import type { AchievementEngineResult } from "../../achievement-engine/models/AchievementEngineResult";
import type { HistoryEngineResult } from "../../athlete-history/models/HistoryEngineResult";
import type { HistorySummary } from "../../athlete-history/models/HistorySummary";
import type { ToolOutput } from "../../tool-calling/models/ToolOutput";
import { freezePayload } from "../utils/freezeObjects";
import {
  validateOutputMapping,
  type OutputMappingValidationCode,
} from "../validators/validateOutputMapping";

export type AthleteDomainResult =
  | HistoryEngineResult
  | HistorySummary
  | AchievementEngineResult;

export type AthleteResultMapResult =
  | { readonly ok: true; readonly output: ToolOutput }
  | {
      readonly ok: false;
      readonly issues: readonly OutputMappingValidationCode[];
    };

/**
 * Map athlete / achievement domain results → ToolOutput.
 */
export class AthleteResultMapper {
  static map(result: AthleteDomainResult): AthleteResultMapResult {
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
