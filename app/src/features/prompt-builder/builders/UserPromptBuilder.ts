import type { PromptMetadata } from "../models/PromptMetadata";
import type { UserPrompt } from "../models/UserPrompt";
import { freezeUserPrompt } from "../utils/freezePackage";
import { normalizeStatements } from "../utils/normalizeWhitespace";

/**
 * Fluent builder for immutable UserPrompt.
 */
export class UserPromptBuilder {
  private id = "";
  private statements: readonly string[] = [];
  private blockIds: readonly string[] = [];
  private requestId: string | null = null;
  private metadata: PromptMetadata = Object.freeze({
    tags: Object.freeze(["user"] as string[]),
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

  withRequestId(requestId: string | null): this {
    this.requestId = requestId;
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

  build(): UserPrompt {
    if (!this.id || !this.frozenAt) {
      throw new Error("UserPromptBuilder missing required fields");
    }

    return freezeUserPrompt({
      id: this.id,
      role: "user",
      statements: this.statements,
      blockIds: this.blockIds,
      requestId: this.requestId,
      metadata: this.metadata,
      frozenAt: this.frozenAt,
    });
  }
}
