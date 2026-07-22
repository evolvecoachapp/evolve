import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoverySummary } from "../models/RecoverySummary";
import { freezeSnapshot } from "../utils/freezeSnapshots";

/**
 * Fluent builder for immutable RecoverySnapshot.
 */
export class RecoverySnapshotBuilder {
  private id = "";
  private context: RecoveryContext | null = null;
  private metrics: RecoveryMetrics | null = null;
  private assessment: RecoveryAssessment | null = null;
  private summary: RecoverySummary | null = null;
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withContext(context: RecoveryContext): this {
    this.context = context;
    return this;
  }

  withMetrics(metrics: RecoveryMetrics): this {
    this.metrics = metrics;
    return this;
  }

  withAssessment(assessment: RecoveryAssessment): this {
    this.assessment = assessment;
    return this;
  }

  withSummary(summary: RecoverySummary): this {
    this.summary = summary;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): RecoverySnapshot {
    if (
      !this.id ||
      !this.context ||
      !this.metrics ||
      !this.assessment ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("RecoverySnapshotBuilder missing required fields");
    }

    return freezeSnapshot({
      id: this.id,
      context: this.context,
      metrics: this.metrics,
      assessment: this.assessment,
      summary: this.summary,
      frozenAt: this.frozenAt,
    });
  }
}
