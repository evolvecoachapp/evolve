import type { HistoryContext } from "../models/HistoryContext";
import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistoryEntryCategory } from "../models/HistoryEntryCategory";
import type { HistoryEntryId } from "../models/HistoryEntryId";
import type { HistoryEntryType } from "../models/HistoryEntryType";
import type { HistoryEvidence } from "../models/HistoryEvidence";
import type { HistoryMetadata } from "../models/HistoryMetadata";
import type { HistoryReference } from "../models/HistoryReference";
import { freezeHistoryEntry } from "../utils/freezeHistory";

/**
 * Fluent builder for immutable HistoryEntry domain objects.
 */
export class HistoryEntryBuilder {
  private id: HistoryEntryId = "";
  private type: HistoryEntryType = "";
  private category: HistoryEntryCategory = "";
  private occurredAt = "";
  private title = "";
  private description = "";
  private references: readonly HistoryReference[] = Object.freeze([]);
  private evidence: HistoryEvidence | null = null;
  private context: HistoryContext | null = null;
  private metadata: HistoryMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({} as Record<string, string | number | boolean>),
  });
  private frozenAt = "";

  withId(id: HistoryEntryId): this {
    this.id = id;
    return this;
  }

  withType(type: HistoryEntryType): this {
    this.type = type;
    return this;
  }

  withCategory(category: HistoryEntryCategory): this {
    this.category = category;
    return this;
  }

  withOccurredAt(occurredAt: string): this {
    this.occurredAt = occurredAt;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withReferences(references: readonly HistoryReference[]): this {
    this.references = references;
    return this;
  }

  withEvidence(evidence: HistoryEvidence): this {
    this.evidence = evidence;
    return this;
  }

  withContext(context: HistoryContext): this {
    this.context = context;
    return this;
  }

  withMetadata(metadata: HistoryMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): HistoryEntry {
    if (
      !this.id ||
      !this.type ||
      !this.category ||
      !this.occurredAt ||
      !this.title ||
      !this.evidence ||
      !this.context ||
      !this.frozenAt
    ) {
      throw new Error("HistoryEntryBuilder missing required fields");
    }

    return freezeHistoryEntry({
      id: this.id,
      type: this.type,
      category: this.category,
      occurredAt: this.occurredAt,
      title: this.title,
      description: this.description,
      references: this.references,
      evidence: this.evidence,
      context: this.context,
      metadata: this.metadata,
      frozenAt: this.frozenAt,
    });
  }
}
