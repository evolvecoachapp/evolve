import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoveryMetrics } from "../../recovery-intelligence/models/RecoveryMetrics";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { ToolInput } from "../../tool-calling/models/ToolInput";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  asDomainPayload,
  extractObjectParameter,
  extractParameter,
} from "../utils/extractParameter";
import { freezePayload } from "../utils/freezeObjects";
import {
  validateInputMapping,
  type InputMappingValidationCode,
} from "../validators/validateInputMapping";

export type RecoveryMappedRequest =
  | {
      readonly toolId: typeof DomainToolIds.RECOVERY_ANALYZE;
      readonly athleteHistory: AthleteHistory;
      readonly performanceSnapshot: PerformanceSnapshot;
      readonly workoutResult?: WorkoutResult | null;
      readonly achievementResult?: AchievementResult | null;
      readonly analyzedAt?: string;
      readonly snapshotId?: string;
      readonly frequencyWindowDays?: number;
    }
  | {
      readonly toolId: typeof DomainToolIds.RECOVERY_SUMMARIZE;
      readonly snapshot:
        | RecoverySnapshot
        | {
            readonly snapshotId: string;
            readonly athleteId: string | null;
            readonly metrics: RecoveryMetrics;
          };
    };

export type RecoveryRequestMapResult =
  | { readonly ok: true; readonly mapped: RecoveryMappedRequest }
  | {
      readonly ok: false;
      readonly issues: readonly InputMappingValidationCode[];
    };

/**
 * Map ToolInput → recovery domain request shapes.
 */
export class RecoveryRequestMapper {
  static map(
    toolId: string,
    input: ToolInput,
  ): RecoveryRequestMapResult {
    if (toolId === DomainToolIds.RECOVERY_ANALYZE) {
      const issues = validateInputMapping(input, [
        { name: "athleteHistory", required: true, type: "object" },
        { name: "performanceSnapshot", required: true, type: "object" },
        { name: "workoutResult", required: false, type: "object" },
        { name: "achievementResult", required: false, type: "object" },
        { name: "analyzedAt", required: false, type: "string" },
        { name: "snapshotId", required: false, type: "string" },
        { name: "frequencyWindowDays", required: false, type: "number" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const athleteHistory = asDomainPayload<AthleteHistory>(
        extractObjectParameter(input, "athleteHistory"),
      );
      const performanceSnapshot = asDomainPayload<PerformanceSnapshot>(
        extractObjectParameter(input, "performanceSnapshot"),
      );
      if (!athleteHistory || !performanceSnapshot) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      const frequencyWindowDays = extractParameter(
        input,
        "frequencyWindowDays",
      );
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.RECOVERY_ANALYZE,
          athleteHistory: freezePayload(athleteHistory),
          performanceSnapshot: freezePayload(performanceSnapshot),
          workoutResult: asDomainPayload<WorkoutResult>(
            extractObjectParameter(input, "workoutResult"),
          ),
          achievementResult: asDomainPayload<AchievementResult>(
            extractObjectParameter(input, "achievementResult"),
          ),
          analyzedAt:
            typeof extractParameter(input, "analyzedAt") === "string"
              ? (extractParameter(input, "analyzedAt") as string)
              : undefined,
          snapshotId:
            typeof extractParameter(input, "snapshotId") === "string"
              ? (extractParameter(input, "snapshotId") as string)
              : undefined,
          frequencyWindowDays:
            typeof frequencyWindowDays === "number"
              ? frequencyWindowDays
              : undefined,
        }),
      };
    }

    if (toolId === DomainToolIds.RECOVERY_SUMMARIZE) {
      const issues = validateInputMapping(input, [
        { name: "snapshot", required: true, type: "object" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const snapshot = asDomainPayload<RecoverySnapshot>(
        extractObjectParameter(input, "snapshot"),
      );
      if (!snapshot) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.RECOVERY_SUMMARIZE,
          snapshot: freezePayload(snapshot),
        }),
      };
    }

    return {
      ok: false,
      issues: Object.freeze(["missing_required_parameter"] as const),
    };
  }
}
