import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import { appendPlanRestored } from "../../coach-timeline/builders/timelineIntegration";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import type { PlanRestoreRequest } from "../models/PlanRestoreRequest";
import type { PlanRestoreResult } from "../models/PlanRestoreResult";
import {
  RestoreConflictCodes,
  type RestoreConflict,
} from "../models/RestoreConflict";
import { applyRestore } from "./applyRestore";
import { previewRestore } from "./previewRestore";
import { resolveRestoreTarget } from "./resolveRestoreTarget";
import { validateRestore } from "./validateRestore";

export interface PlanRestoreServiceDeps {
  readonly planHistory: PlanHistoryService;
  readonly coachTimeline?: CoachTimelineService | null;
  readonly clock?: () => string;
}

/**
 * Plan Restore orchestration:
 * Resolve Target → Preview → Validate → Restore Snapshot → Publish New Version
 *
 * Not a regeneration or adaptation engine.
 */
export class PlanRestoreService {
  private readonly planHistory: PlanHistoryService;
  private readonly coachTimeline: CoachTimelineService | null;
  private readonly clock: () => string;

  constructor(deps: PlanRestoreServiceDeps) {
    this.planHistory = deps.planHistory;
    this.coachTimeline = deps.coachTimeline ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  getPlanHistory(): PlanHistoryService {
    return this.planHistory;
  }

  restore(request: PlanRestoreRequest): PlanRestoreResult {
    const startedAt = this.clock();
    const history = this.planHistory.getHistory(request.target.lineageId);

    const resolved = resolveRestoreTarget({
      history,
      target: request.target,
    });

    if (!resolved.success || !resolved.snapshot || !history) {
      const completedAt = this.clock();
      return Object.freeze({
        id: `restore-result:${request.id}`,
        success: false,
        message:
          resolved.conflicts.map((item) => item.message).join("; ") ||
          "Failed to resolve restore target",
        request,
        preview: null,
        validation: null,
        publishedVersion: null,
        publishedSnapshot: null,
        workoutPlan: null,
        nutritionPlan: null,
        conflicts: resolved.conflicts,
        restoredSummary: "",
        revertedSummary: "",
        restoreReason: request.message,
        progressionImpact:
          "No restore applied; progression posture unchanged.",
        startedAt,
        completedAt,
      });
    }

    const preview = previewRestore({
      id: `preview:${request.id}`,
      request,
      history,
      targetSnapshot: resolved.snapshot,
      createdAt: this.clock(),
    });

    const { validation, conflicts } = validateRestore({
      history,
      snapshot: resolved.snapshot,
      expectedPlanType: request.target.planType,
      historyService: this.planHistory,
    });

    if (!validation.valid) {
      const completedAt = this.clock();
      return Object.freeze({
        id: `restore-result:${request.id}`,
        success: false,
        message: validation.errors.join("; ") || "Restore validation failed",
        request,
        preview,
        validation,
        publishedVersion: null,
        publishedSnapshot: null,
        workoutPlan: null,
        nutritionPlan: null,
        conflicts:
          conflicts.length > 0
            ? conflicts
            : Object.freeze([
                Object.freeze({
                  code: RestoreConflictCodes.VALIDATION_FAILED,
                  message: "Restore validation failed",
                  field: null,
                } satisfies RestoreConflict),
              ]),
        restoredSummary: "",
        revertedSummary: preview.discardedChangesSummary.join("; "),
        restoreReason: request.message,
        progressionImpact:
          "No restore applied; progression posture unchanged.",
        startedAt,
        completedAt,
      });
    }

    const result = applyRestore({
      request,
      preview,
      validation,
      historyService: this.planHistory,
      startedAt,
      completedAt: this.clock(),
    });

    if (result.success && result.publishedVersion) {
      appendPlanRestored({
        timeline: this.coachTimeline,
        athleteId: request.athleteId,
        planType: request.target.planType,
        lineageId: request.target.lineageId,
        versionNumber: result.publishedVersion.versionNumber,
        conversationId: request.conversationId,
        sessionId: request.sessionId,
        summary: result.restoredSummary,
        explanation: result.restoreReason,
        impact: result.progressionImpact,
        at: result.completedAt,
      });
    }

    return result;
  }

  previewOnly(request: PlanRestoreRequest) {
    const history = this.planHistory.getHistory(request.target.lineageId);
    const resolved = resolveRestoreTarget({
      history,
      target: request.target,
    });
    if (!resolved.success || !resolved.snapshot || !history) {
      return Object.freeze({
        success: false as const,
        preview: null,
        conflicts: resolved.conflicts,
      });
    }
    return Object.freeze({
      success: true as const,
      preview: previewRestore({
        id: `preview:${request.id}`,
        request,
        history,
        targetSnapshot: resolved.snapshot,
        createdAt: this.clock(),
      }),
      conflicts: Object.freeze([] as RestoreConflict[]),
    });
  }
}

export function createPlanRestoreService(
  deps: PlanRestoreServiceDeps,
): PlanRestoreService {
  return new PlanRestoreService(deps);
}
