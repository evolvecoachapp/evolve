import type { InsightCollection } from "../models/InsightCollection";
import type { InsightContext } from "../models/InsightContext";
import type { InsightSnapshot } from "../models/InsightSnapshot";
import type { InsightSummary } from "../models/InsightSummary";
import { freezeSnapshot } from "../utils/freezeSnapshots";

/**
 * Fluent builder for immutable InsightSnapshot.
 */
export class InsightSnapshotBuilder {
  private id = "";
  private context: InsightContext | null = null;
  private collection: InsightCollection | null = null;
  private summary: InsightSummary | null = null;
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withContext(context: InsightContext): this {
    this.context = context;
    return this;
  }

  withCollection(collection: InsightCollection): this {
    this.collection = collection;
    return this;
  }

  withSummary(summary: InsightSummary): this {
    this.summary = summary;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): InsightSnapshot {
    if (
      !this.id ||
      !this.context ||
      !this.collection ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("InsightSnapshotBuilder missing required fields");
    }

    return freezeSnapshot({
      id: this.id,
      context: this.context,
      collection: this.collection,
      summary: this.summary,
      frozenAt: this.frozenAt,
    });
  }
}
