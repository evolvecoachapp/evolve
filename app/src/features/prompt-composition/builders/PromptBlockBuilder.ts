import type { PromptBlock } from "../models/PromptBlock";
import type { PromptBlockType } from "../models/PromptBlockType";
import {
  DEFAULT_BLOCK_ORDER,
  PromptBlockTypes,
} from "../models/PromptBlockType";
import type { PromptMetadata } from "../models/PromptMetadata";
import type { PromptPriority } from "../models/PromptPriority";
import { PROMPT_PRIORITY_DEFAULT } from "../models/PromptPriority";
import type { PromptSection } from "../models/PromptSection";
import { PromptSections } from "../models/PromptSection";
import { freezeBlock } from "../utils/freezePackage";

/**
 * Fluent builder for immutable PromptBlock.
 */
export class PromptBlockBuilder {
  private id = "";
  private type: PromptBlockType = PromptBlockTypes.SYSTEM;
  private section: PromptSection = PromptSections.SYSTEM;
  private priority: PromptPriority = PROMPT_PRIORITY_DEFAULT;
  private order: number | null = null;
  private title = "";
  private statement = "";
  private refs: readonly string[] = [];
  private metadata: PromptMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
  });
  private attributes: Readonly<
    Record<string, string | number | boolean | null>
  > = Object.freeze({});

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withType(type: PromptBlockType): this {
    this.type = type;
    return this;
  }

  withSection(section: PromptSection): this {
    this.section = section;
    return this;
  }

  withPriority(priority: PromptPriority): this {
    this.priority = priority;
    return this;
  }

  withOrder(order: number): this {
    this.order = order;
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

  withRefs(refs: readonly string[]): this {
    this.refs = refs;
    return this;
  }

  withMetadata(metadata: PromptMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withAttributes(
    attributes: Readonly<Record<string, string | number | boolean | null>>,
  ): this {
    this.attributes = attributes;
    return this;
  }

  build(): PromptBlock {
    if (!this.id || !this.title || !this.statement) {
      throw new Error("PromptBlockBuilder missing required fields");
    }

    return freezeBlock({
      id: this.id,
      type: this.type,
      section: this.section,
      priority: this.priority,
      order: this.order ?? DEFAULT_BLOCK_ORDER[this.type] ?? 999,
      title: this.title,
      statement: this.statement,
      refs: Object.freeze([...this.refs]),
      metadata: this.metadata,
      attributes: Object.freeze({ ...this.attributes }),
    });
  }
}
