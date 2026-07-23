import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { PersonalRecordBaselineProvider } from "../../achievement-engine/models/PersonalRecordBaseline";
import { MapPersonalRecordBaselineProvider } from "../../achievement-engine/models/PersonalRecordBaseline";
import type { PersonalRecordType } from "../../achievement-engine/models/PersonalRecordType";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { HistoryEntry } from "../../athlete-history/models/HistoryEntry";
import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { ToolInput } from "../../tool-calling/models/ToolInput";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  asDomainPayload,
  extractObjectParameter,
  extractParameter,
  hasParameter,
} from "../utils/extractParameter";
import { freezePayload } from "../utils/freezeObjects";
import {
  validateInputMapping,
  type InputMappingValidationCode,
} from "../validators/validateInputMapping";

export type AthleteMappedRequest =
  | {
      readonly toolId: typeof DomainToolIds.ATHLETE_BUILD_HISTORY;
      readonly workoutResult?: WorkoutResult | null;
      readonly performanceSnapshot?: PerformanceSnapshot | null;
      readonly achievementResult?: AchievementResult | null;
      readonly eventStream?: EventStream | null;
      readonly athleteId?: string | null;
      readonly historyId?: string;
      readonly snapshotId?: string;
      readonly builtAt?: string;
    }
  | {
      readonly toolId: typeof DomainToolIds.ATHLETE_SUMMARIZE_HISTORY;
      readonly historyOrParts:
        | AthleteHistory
        | {
            readonly historyId: string;
            readonly athleteId: string | null;
            readonly entries: readonly HistoryEntry[];
          };
    }
  | {
      readonly toolId: typeof DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS;
      readonly performanceSnapshot: PerformanceSnapshot;
      readonly workoutResult: WorkoutResult;
      readonly baselineProvider: PersonalRecordBaselineProvider;
      readonly evaluatedAt?: string;
      readonly evaluationId?: string;
    };

export type AthleteRequestMapResult =
  | { readonly ok: true; readonly mapped: AthleteMappedRequest }
  | {
      readonly ok: false;
      readonly issues: readonly InputMappingValidationCode[];
    };

/**
 * Map ToolInput → athlete history / achievement request shapes.
 */
export class AthleteRequestMapper {
  static map(toolId: string, input: ToolInput): AthleteRequestMapResult {
    if (toolId === DomainToolIds.ATHLETE_BUILD_HISTORY) {
      const issues = validateInputMapping(input, [
        { name: "workoutResult", required: false, type: "object" },
        { name: "performanceSnapshot", required: false, type: "object" },
        { name: "achievementResult", required: false, type: "object" },
        { name: "eventStream", required: false, type: "object" },
        { name: "athleteId", required: false, type: "string" },
        { name: "historyId", required: false, type: "string" },
        { name: "snapshotId", required: false, type: "string" },
        { name: "builtAt", required: false, type: "string" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const athleteId = extractParameter(input, "athleteId");
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.ATHLETE_BUILD_HISTORY,
          workoutResult: asDomainPayload<WorkoutResult>(
            extractObjectParameter(input, "workoutResult"),
          ),
          performanceSnapshot: asDomainPayload<PerformanceSnapshot>(
            extractObjectParameter(input, "performanceSnapshot"),
          ),
          achievementResult: asDomainPayload<AchievementResult>(
            extractObjectParameter(input, "achievementResult"),
          ),
          eventStream: asDomainPayload<EventStream>(
            extractObjectParameter(input, "eventStream"),
          ),
          athleteId:
            typeof athleteId === "string" || athleteId === null
              ? (athleteId as string | null)
              : undefined,
          historyId: asOptionalString(extractParameter(input, "historyId")),
          snapshotId: asOptionalString(extractParameter(input, "snapshotId")),
          builtAt: asOptionalString(extractParameter(input, "builtAt")),
        }),
      };
    }

    if (toolId === DomainToolIds.ATHLETE_SUMMARIZE_HISTORY) {
      const issues = validateInputMapping(input, [
        { name: "historyOrParts", required: true, type: "object" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const historyOrParts = asDomainPayload<AthleteHistory>(
        extractObjectParameter(input, "historyOrParts"),
      );
      if (!historyOrParts) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.ATHLETE_SUMMARIZE_HISTORY,
          historyOrParts: freezePayload(historyOrParts),
        }),
      };
    }

    if (toolId === DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS) {
      const issues = validateInputMapping(input, [
        { name: "performanceSnapshot", required: true, type: "object" },
        { name: "workoutResult", required: true, type: "object" },
        { name: "baselines", required: false, type: "object" },
        { name: "exerciseVolumes", required: false, type: "object" },
        { name: "evaluatedAt", required: false, type: "string" },
        { name: "evaluationId", required: false, type: "string" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const performanceSnapshot = asDomainPayload<PerformanceSnapshot>(
        extractObjectParameter(input, "performanceSnapshot"),
      );
      const workoutResult = asDomainPayload<WorkoutResult>(
        extractObjectParameter(input, "workoutResult"),
      );
      if (!performanceSnapshot || !workoutResult) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }

      const baselineProvider = resolveBaselineProvider(input);

      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS,
          performanceSnapshot: freezePayload(performanceSnapshot),
          workoutResult: freezePayload(workoutResult),
          baselineProvider,
          evaluatedAt: asOptionalString(
            extractParameter(input, "evaluatedAt"),
          ),
          evaluationId: asOptionalString(
            extractParameter(input, "evaluationId"),
          ),
        }),
      };
    }

    return {
      ok: false,
      issues: Object.freeze(["missing_required_parameter"] as const),
    };
  }
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Map optional baseline parameters → PersonalRecordBaselineProvider.
 * Translation only — empty map when omitted.
 */
function resolveBaselineProvider(
  input: ToolInput,
): PersonalRecordBaselineProvider {
  const provided = extractParameter(input, "baselineProvider");
  if (
    provided &&
    typeof provided === "object" &&
    typeof (provided as PersonalRecordBaselineProvider).getBaseline ===
      "function"
  ) {
    return provided as PersonalRecordBaselineProvider;
  }

  const baselines = hasParameter(input, "baselines")
    ? ((extractObjectParameter(input, "baselines") ?? {}) as Partial<
        Record<PersonalRecordType, number>
      >)
    : {};
  const exerciseVolumes = hasParameter(input, "exerciseVolumes")
    ? ((extractObjectParameter(input, "exerciseVolumes") ?? {}) as Record<
        string,
        number
      >)
    : {};

  return new MapPersonalRecordBaselineProvider(baselines, exerciseVolumes);
}
