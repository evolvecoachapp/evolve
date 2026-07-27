import type { PlanHistory } from "../models/PlanHistory";
import type { PlanSnapshot } from "../models/PlanSnapshot";
import type { PublishPlanVersionRequest } from "../models/PublishPlanVersionRequest";
import {
  createPlanHistoryStore,
  PlanHistoryStore,
} from "../store/PlanHistoryStore";
import { computeSnapshotChecksum } from "../utils/computeSnapshotChecksum";

export interface PlanHistoryServiceDeps {
  readonly store?: PlanHistoryStore;
  readonly clock?: () => string;
}

/**
 * Plan History service — append-only versioned snapshots.
 * Presentation / domain only. No persistence. No engines.
 */
export class PlanHistoryService {
  private readonly store: PlanHistoryStore;
  private readonly clock: () => string;

  constructor(deps: PlanHistoryServiceDeps = {}) {
    this.store = deps.store ?? createPlanHistoryStore();
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  getStore(): PlanHistoryStore {
    return this.store;
  }

  publishVersion(request: PublishPlanVersionRequest): PlanSnapshot {
    return this.store.publish(request);
  }

  getHistory(lineageId: string): PlanHistory | null {
    return this.store.getHistory(lineageId);
  }

  getSnapshot(
    lineageId: string,
    versionNumber: number,
  ): PlanSnapshot | null {
    return this.store.getSnapshot(lineageId, versionNumber);
  }

  getSnapshotById(snapshotId: string): PlanSnapshot | null {
    return this.store.getSnapshotById(snapshotId);
  }

  getCurrentSnapshot(lineageId: string): PlanSnapshot | null {
    const history = this.store.getHistory(lineageId);
    if (!history) return null;
    return this.store.getSnapshot(lineageId, history.currentVersionNumber);
  }

  validateSnapshotIntegrity(snapshot: PlanSnapshot): boolean {
    if (snapshot.corrupted) return false;
    const expected = computeSnapshotChecksum({
      planType: snapshot.version.planType,
      planId: snapshot.version.planId,
      lineageId: snapshot.version.lineageId,
      versionNumber: snapshot.version.versionNumber,
      publishedAt: snapshot.version.publishedAt,
      workoutPlan: snapshot.workoutPlan,
      nutritionPlan: snapshot.nutritionPlan,
    });
    if (expected !== snapshot.version.checksum) return false;
    if (snapshot.version.planType === "workout") {
      return snapshot.workoutPlan !== null && snapshot.nutritionPlan === null;
    }
    return snapshot.nutritionPlan !== null && snapshot.workoutPlan === null;
  }

  now(): string {
    return this.clock();
  }
}

export function createPlanHistoryService(
  deps: PlanHistoryServiceDeps = {},
): PlanHistoryService {
  return new PlanHistoryService(deps);
}
