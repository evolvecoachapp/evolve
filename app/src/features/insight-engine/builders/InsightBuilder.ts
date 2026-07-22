import type { Insight } from "../models/Insight";
import type { InsightCategory } from "../models/InsightCategory";
import type { InsightEvidence } from "../models/InsightEvidence";
import type { InsightMetadata } from "../models/InsightMetadata";
import type { InsightPriority } from "../models/InsightPriority";
import { INSIGHT_PRIORITY_DEFAULT } from "../models/InsightPriority";
import type { InsightReason } from "../models/InsightReason";
import type { InsightSeverity } from "../models/InsightSeverity";
import { InsightSeverities } from "../models/InsightSeverity";
import type { InsightStatus } from "../models/InsightStatus";
import { InsightStatuses } from "../models/InsightStatus";
import type { InsightType } from "../models/InsightType";
import { freezeInsight } from "../utils/freezeSnapshots";
import { normalizePriority } from "../utils/normalizePriorities";

/**
 * Fluent builder for immutable Insight facts.
 */
export class InsightBuilder {
  private id = "";
  private type: InsightType | null = null;
  private category: InsightCategory | null = null;
  private severity: InsightSeverity = InsightSeverities.INFO;
  private priority: InsightPriority = INSIGHT_PRIORITY_DEFAULT;
  private status: InsightStatus = InsightStatuses.ACTIVE;
  private title = "";
  private statement = "";
  private reason: InsightReason | null = null;
  private evidence: InsightEvidence | null = null;
  private metadata: InsightMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
  });
  private generatedAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withType(type: InsightType): this {
    this.type = type;
    return this;
  }

  withCategory(category: InsightCategory): this {
    this.category = category;
    return this;
  }

  withSeverity(severity: InsightSeverity): this {
    this.severity = severity;
    return this;
  }

  withPriority(priority: InsightPriority): this {
    this.priority = normalizePriority(priority);
    return this;
  }

  withStatus(status: InsightStatus): this {
    this.status = status;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withStatement(statement: string): this {
    this.statement = statement;
    return this;
  }

  withReason(reason: InsightReason): this {
    this.reason = reason;
    return this;
  }

  withEvidence(evidence: InsightEvidence): this {
    this.evidence = evidence;
    return this;
  }

  withMetadata(metadata: InsightMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withGeneratedAt(generatedAt: string): this {
    this.generatedAt = generatedAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): Insight {
    if (
      !this.id ||
      !this.type ||
      !this.category ||
      !this.title ||
      !this.statement ||
      !this.reason ||
      !this.evidence ||
      !this.generatedAt ||
      !this.frozenAt
    ) {
      throw new Error("InsightBuilder missing required fields");
    }

    return freezeInsight({
      id: this.id,
      type: this.type,
      category: this.category,
      severity: this.severity,
      priority: this.priority,
      status: this.status,
      title: this.title,
      statement: this.statement,
      reason: this.reason,
      evidence: this.evidence,
      metadata: this.metadata,
      generatedAt: this.generatedAt,
      frozenAt: this.frozenAt,
    });
  }
}
