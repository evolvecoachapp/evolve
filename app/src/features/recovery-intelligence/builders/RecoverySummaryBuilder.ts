import type { RecoveryStatusLevel } from "../models/RecoveryStatus";
import type { RecoverySummary } from "../models/RecoverySummary";
import { buildSummaryText } from "../utils/formatting";
import { freezeSummary } from "../utils/freezeSnapshots";

/**
 * Fluent builder for immutable RecoverySummary.
 */
export class RecoverySummaryBuilder {
  private snapshotId = "";
  private athleteId: string | null = null;
  private status: RecoveryStatusLevel = "insufficient_data";
  private fatigueScore = 0;
  private sessionLoad = 0;
  private workoutsInWindow = 0;
  private windowDurationHours = 0;
  private summaryText: string | null = null;

  withIds(input: {
    readonly snapshotId: string;
    readonly athleteId: string | null;
  }): this {
    this.snapshotId = input.snapshotId;
    this.athleteId = input.athleteId;
    return this;
  }

  withStatus(status: RecoveryStatusLevel): this {
    this.status = status;
    return this;
  }

  withMetrics(input: {
    readonly fatigueScore: number;
    readonly sessionLoad: number;
    readonly workoutsInWindow: number;
    readonly windowDurationHours: number;
  }): this {
    this.fatigueScore = input.fatigueScore;
    this.sessionLoad = input.sessionLoad;
    this.workoutsInWindow = input.workoutsInWindow;
    this.windowDurationHours = input.windowDurationHours;
    return this;
  }

  withSummaryText(summaryText: string): this {
    this.summaryText = summaryText;
    return this;
  }

  build(): RecoverySummary {
    if (!this.snapshotId) {
      throw new Error("RecoverySummaryBuilder missing snapshotId");
    }

    const summaryText =
      this.summaryText ??
      buildSummaryText({
        status: this.status,
        fatigueScore: this.fatigueScore,
        sessionLoad: this.sessionLoad,
        workoutsInWindow: this.workoutsInWindow,
        windowDurationHours: this.windowDurationHours,
      });

    return freezeSummary({
      snapshotId: this.snapshotId,
      athleteId: this.athleteId,
      status: this.status,
      fatigueScore: this.fatigueScore,
      sessionLoad: this.sessionLoad,
      workoutsInWindow: this.workoutsInWindow,
      windowDurationHours: this.windowDurationHours,
      summaryText,
    });
  }
}
