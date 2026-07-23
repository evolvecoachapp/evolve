import type { RecoveryEngineResult } from "../../recovery-intelligence/models/RecoveryEngineResult";
import type { RecoverySummary } from "../../recovery-intelligence/models/RecoverySummary";
import type { ToolOutput } from "../../tool-calling/models/ToolOutput";
import { freezePayload } from "../utils/freezeObjects";
import {
  validateOutputMapping,
  type OutputMappingValidationCode,
} from "../validators/validateOutputMapping";

export type RecoveryDomainResult = RecoveryEngineResult | RecoverySummary;

export type RecoveryResultMapResult =
  | { readonly ok: true; readonly output: ToolOutput }
  | {
      readonly ok: false;
      readonly issues: readonly OutputMappingValidationCode[];
    };

/**
 * Map recovery domain results → ToolOutput.
 */
export class RecoveryResultMapper {
  static map(result: RecoveryDomainResult): RecoveryResultMapResult {
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
