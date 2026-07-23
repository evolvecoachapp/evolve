import type { PromptMetadata } from "../models/PromptMetadata";
import type { SystemPrompt } from "../models/SystemPrompt";
import { freezeSystemPrompt } from "../utils/freezePackage";
import { normalizeStatements } from "../utils/normalizeWhitespace";

/**
 * Fluent builder for immutable SystemPrompt.
 */
export class SystemPromptBuilder {
  private id = "";
  private statements: readonly string[] = [];
  private blockIds: readonly string[] = [];
  private metadata: PromptMetadata = Object.freeze({
    tags: Object.freeze(["system"] as string[]),
    attributes: Object.freeze({}),
  });
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withStatements(statements: readonly string[]): this {
    this.statements = normalizeStatements(statements);
    return this;
  }

  withBlockIds(blockIds: readonly string[]): this {
    this.blockIds = blockIds;
    return this;
  }

  withMetadata(metadata: PromptMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): SystemPrompt {
    if (!this.id || !this.frozenAt) {
      throw new Error("SystemPromptBuilder missing required fields");
    }

    return freezeSystemPrompt({
      id: this.id,
      role: "system",
      statements: this.statements,
      blockIds: this.blockIds,
      metadata: this.metadata,
      frozenAt: this.frozenAt,
    });
  }
}
