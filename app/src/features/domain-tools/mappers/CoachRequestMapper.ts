import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { CoachAudience } from "../../coach-intelligence/models/CoachAudience";
import type { CoachCommunicationStyle } from "../../coach-intelligence/models/CoachCommunicationStyle";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { CoachContextSnapshot } from "../../coach-intelligence/models/CoachContextSnapshot";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { ToolInput } from "../../tool-calling/models/ToolInput";
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

export type CoachMappedRequest =
  | {
      readonly toolId: typeof DomainToolIds.COACH_PREPARE_CONTEXT;
      readonly insightSnapshot: InsightSnapshot;
      readonly recoverySnapshot?: RecoverySnapshot;
      readonly athleteHistory?: AthleteHistory;
      readonly achievementResult?: AchievementResult;
      readonly performanceSnapshot?: PerformanceSnapshot;
      readonly preparedAt?: string;
      readonly contextId?: string;
      readonly audience?: CoachAudience;
      readonly communicationStyle?: CoachCommunicationStyle;
    }
  | {
      readonly toolId: typeof DomainToolIds.COACH_GENERATE_INSIGHTS;
      readonly performanceSnapshot: PerformanceSnapshot;
      readonly achievementResult: AchievementResult;
      readonly recoverySnapshot: RecoverySnapshot;
      readonly athleteHistory: AthleteHistory;
      readonly generatedAt?: string;
      readonly snapshotId?: string;
    }
  | {
      readonly toolId: typeof DomainToolIds.COACH_SUMMARIZE;
      readonly contextOrSnapshot: CoachingContext | CoachContextSnapshot;
    };

export type CoachRequestMapResult =
  | { readonly ok: true; readonly mapped: CoachMappedRequest }
  | {
      readonly ok: false;
      readonly issues: readonly InputMappingValidationCode[];
    };

/**
 * Map ToolInput → coach / insight domain request shapes.
 */
export class CoachRequestMapper {
  static map(toolId: string, input: ToolInput): CoachRequestMapResult {
    if (toolId === DomainToolIds.COACH_PREPARE_CONTEXT) {
      const issues = validateInputMapping(input, [
        { name: "insightSnapshot", required: true, type: "object" },
        { name: "recoverySnapshot", required: false, type: "object" },
        { name: "athleteHistory", required: false, type: "object" },
        { name: "achievementResult", required: false, type: "object" },
        { name: "performanceSnapshot", required: false, type: "object" },
        { name: "preparedAt", required: false, type: "string" },
        { name: "contextId", required: false, type: "string" },
        { name: "audience", required: false, type: "string" },
        { name: "communicationStyle", required: false, type: "string" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const insightSnapshot = asDomainPayload<InsightSnapshot>(
        extractObjectParameter(input, "insightSnapshot"),
      );
      if (!insightSnapshot) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      const audience = extractParameter(input, "audience");
      const communicationStyle = extractParameter(
        input,
        "communicationStyle",
      );
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.COACH_PREPARE_CONTEXT,
          insightSnapshot: freezePayload(insightSnapshot),
          recoverySnapshot:
            asDomainPayload<RecoverySnapshot>(
              extractObjectParameter(input, "recoverySnapshot"),
            ) ?? undefined,
          athleteHistory:
            asDomainPayload<AthleteHistory>(
              extractObjectParameter(input, "athleteHistory"),
            ) ?? undefined,
          achievementResult:
            asDomainPayload<AchievementResult>(
              extractObjectParameter(input, "achievementResult"),
            ) ?? undefined,
          performanceSnapshot:
            asDomainPayload<PerformanceSnapshot>(
              extractObjectParameter(input, "performanceSnapshot"),
            ) ?? undefined,
          preparedAt: asOptionalString(extractParameter(input, "preparedAt")),
          contextId: asOptionalString(extractParameter(input, "contextId")),
          audience:
            typeof audience === "string"
              ? (audience as CoachAudience)
              : undefined,
          communicationStyle:
            typeof communicationStyle === "string"
              ? (communicationStyle as CoachCommunicationStyle)
              : undefined,
        }),
      };
    }

    if (toolId === DomainToolIds.COACH_GENERATE_INSIGHTS) {
      const issues = validateInputMapping(input, [
        { name: "performanceSnapshot", required: true, type: "object" },
        { name: "achievementResult", required: true, type: "object" },
        { name: "recoverySnapshot", required: true, type: "object" },
        { name: "athleteHistory", required: true, type: "object" },
        { name: "generatedAt", required: false, type: "string" },
        { name: "snapshotId", required: false, type: "string" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const performanceSnapshot = asDomainPayload<PerformanceSnapshot>(
        extractObjectParameter(input, "performanceSnapshot"),
      );
      const achievementResult = asDomainPayload<AchievementResult>(
        extractObjectParameter(input, "achievementResult"),
      );
      const recoverySnapshot = asDomainPayload<RecoverySnapshot>(
        extractObjectParameter(input, "recoverySnapshot"),
      );
      const athleteHistory = asDomainPayload<AthleteHistory>(
        extractObjectParameter(input, "athleteHistory"),
      );
      if (
        !performanceSnapshot ||
        !achievementResult ||
        !recoverySnapshot ||
        !athleteHistory
      ) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.COACH_GENERATE_INSIGHTS,
          performanceSnapshot: freezePayload(performanceSnapshot),
          achievementResult: freezePayload(achievementResult),
          recoverySnapshot: freezePayload(recoverySnapshot),
          athleteHistory: freezePayload(athleteHistory),
          generatedAt: asOptionalString(
            extractParameter(input, "generatedAt"),
          ),
          snapshotId: asOptionalString(extractParameter(input, "snapshotId")),
        }),
      };
    }

    if (toolId === DomainToolIds.COACH_SUMMARIZE) {
      const issues = validateInputMapping(input, [
        { name: "contextOrSnapshot", required: true, type: "object" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const contextOrSnapshot = asDomainPayload<
        CoachingContext | CoachContextSnapshot
      >(extractObjectParameter(input, "contextOrSnapshot"));
      if (!contextOrSnapshot) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.COACH_SUMMARIZE,
          contextOrSnapshot: freezePayload(contextOrSnapshot),
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
