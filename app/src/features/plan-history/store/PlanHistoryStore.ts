import type { PlanHistory } from "../models/PlanHistory";
import type { PlanSnapshot } from "../models/PlanSnapshot";
import type { PlanType } from "../models/PlanType";
import type { PlanVersion } from "../models/PlanVersion";
import type { PublishPlanVersionRequest } from "../models/PublishPlanVersionRequest";
import { computeSnapshotChecksum } from "../utils/computeSnapshotChecksum";

/**
 * In-memory immutable plan history store.
 * Append-only — never mutates or deletes published snapshots.
 */
export class PlanHistoryStore {
  private readonly histories = new Map<string, PlanHistory>();

  getHistory(lineageId: string): PlanHistory | null {
    return this.histories.get(lineageId) ?? null;
  }

  listLineageIds(planType?: PlanType): readonly string[] {
    const ids: string[] = [];
    for (const history of this.histories.values()) {
      if (!planType || history.planType === planType) {
        ids.push(history.lineageId);
      }
    }
    return Object.freeze(ids);
  }

  publish(request: PublishPlanVersionRequest): PlanSnapshot {
    if (request.planType === "workout" && !request.workoutPlan) {
      throw new Error("Workout publish requires workoutPlan");
    }
    if (request.planType === "nutrition" && !request.nutritionPlan) {
      throw new Error("Nutrition publish requires nutritionPlan");
    }
    if (request.planType === "workout" && request.nutritionPlan) {
      throw new Error("Workout publish must not include nutritionPlan");
    }
    if (request.planType === "nutrition" && request.workoutPlan) {
      throw new Error("Nutrition publish must not include workoutPlan");
    }

    const existing = this.histories.get(request.lineageId);
    if (existing && existing.planType !== request.planType) {
      throw new Error(
        `Lineage ${request.lineageId} is ${existing.planType}; cannot publish ${request.planType}`,
      );
    }
    if (existing && existing.athleteId !== request.athleteId) {
      throw new Error(
        `Lineage ${request.lineageId} belongs to athlete ${existing.athleteId}`,
      );
    }

    const versionNumber = (existing?.currentVersionNumber ?? 0) + 1;
    const planId =
      request.planType === "workout"
        ? request.workoutPlan!.id
        : request.nutritionPlan!.id;
    const snapshotId = `snap:${request.lineageId}:v${versionNumber}:${request.id}`;

    const checksum = computeSnapshotChecksum({
      planType: request.planType,
      planId,
      lineageId: request.lineageId,
      versionNumber,
      publishedAt: request.createdAt,
      workoutPlan: request.workoutPlan,
      nutritionPlan: request.nutritionPlan,
    });

    const version: PlanVersion = Object.freeze({
      versionNumber,
      snapshotId,
      planId,
      lineageId: request.lineageId,
      planType: request.planType,
      changeReason: request.changeReason,
      changeSummary: request.changeSummary,
      checksum,
      publishedAt: request.createdAt,
      athleteId: request.athleteId,
      conversationId: request.conversationId,
      sessionId: request.sessionId,
    });

    const snapshot: PlanSnapshot = Object.freeze({
      id: snapshotId,
      version,
      workoutPlan: request.workoutPlan,
      nutritionPlan: request.nutritionPlan,
      corrupted: request.markCorrupted === true,
    });

    const nextHistory: PlanHistory = Object.freeze({
      lineageId: request.lineageId,
      planType: request.planType,
      athleteId: request.athleteId,
      currentVersionNumber: versionNumber,
      versions: Object.freeze([...(existing?.versions ?? []), version]),
      snapshots: Object.freeze([...(existing?.snapshots ?? []), snapshot]),
      createdAt: existing?.createdAt ?? request.createdAt,
      updatedAt: request.createdAt,
    });

    this.histories.set(request.lineageId, nextHistory);
    return snapshot;
  }

  getSnapshot(
    lineageId: string,
    versionNumber: number,
  ): PlanSnapshot | null {
    const history = this.histories.get(lineageId);
    if (!history) return null;
    return (
      history.snapshots.find(
        (item) => item.version.versionNumber === versionNumber,
      ) ?? null
    );
  }

  getSnapshotById(snapshotId: string): PlanSnapshot | null {
    for (const history of this.histories.values()) {
      const found = history.snapshots.find((item) => item.id === snapshotId);
      if (found) return found;
    }
    return null;
  }
}

export function createPlanHistoryStore(): PlanHistoryStore {
  return new PlanHistoryStore();
}
