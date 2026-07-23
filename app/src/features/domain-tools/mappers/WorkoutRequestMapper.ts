import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { DecisionReport } from "../../../core/decision-intelligence/models/DecisionReport";
import type { WorkoutGenerationRequest } from "../../program-generation/models/WorkoutGenerationRequest";
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

export type WorkoutMappedRequest =
  | {
      readonly toolId: typeof DomainToolIds.WORKOUT_GENERATE;
      readonly request: WorkoutGenerationRequest;
    }
  | {
      readonly toolId: typeof DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE;
      readonly workoutResult: WorkoutResult;
      readonly eventStream: EventStream;
      readonly decisionReport?: DecisionReport | null;
      readonly analyzedAt?: string;
      readonly snapshotId?: string;
    };

export type WorkoutRequestMapResult =
  | {
      readonly ok: true;
      readonly mapped: WorkoutMappedRequest;
    }
  | {
      readonly ok: false;
      readonly issues: readonly InputMappingValidationCode[];
    };

/**
 * Map ToolInput → workout domain request shapes.
 * No generation / performance logic.
 */
export class WorkoutRequestMapper {
  static map(
    toolId: string,
    input: ToolInput,
  ): WorkoutRequestMapResult {
    if (toolId === DomainToolIds.WORKOUT_GENERATE) {
      const issues = validateInputMapping(input, [
        { name: "request", required: true, type: "object" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const request = asDomainPayload<WorkoutGenerationRequest>(
        extractObjectParameter(input, "request"),
      );
      if (!request) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.WORKOUT_GENERATE,
          request: freezePayload(request),
        }),
      };
    }

    if (toolId === DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE) {
      const issues = validateInputMapping(input, [
        { name: "workoutResult", required: true, type: "object" },
        { name: "eventStream", required: true, type: "object" },
        { name: "decisionReport", required: false, type: "object" },
        { name: "analyzedAt", required: false, type: "string" },
        { name: "snapshotId", required: false, type: "string" },
      ]);
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      const workoutResult = asDomainPayload<WorkoutResult>(
        extractObjectParameter(input, "workoutResult"),
      );
      const eventStream = asDomainPayload<EventStream>(
        extractObjectParameter(input, "eventStream"),
      );
      if (!workoutResult || !eventStream) {
        return {
          ok: false,
          issues: Object.freeze(["invalid_parameter_type"] as const),
        };
      }
      const decisionReport = asDomainPayload<DecisionReport>(
        extractObjectParameter(input, "decisionReport"),
      );
      const analyzedAt = extractParameter(input, "analyzedAt");
      const snapshotId = extractParameter(input, "snapshotId");
      return {
        ok: true,
        mapped: Object.freeze({
          toolId: DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE,
          workoutResult: freezePayload(workoutResult),
          eventStream: freezePayload(eventStream),
          decisionReport: decisionReport
            ? freezePayload(decisionReport)
            : null,
          analyzedAt:
            typeof analyzedAt === "string" ? analyzedAt : undefined,
          snapshotId:
            typeof snapshotId === "string" ? snapshotId : undefined,
        }),
      };
    }

    return {
      ok: false,
      issues: Object.freeze(["missing_required_parameter"] as const),
    };
  }
}
