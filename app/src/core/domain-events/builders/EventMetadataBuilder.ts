import type { EventMetadata } from "../models/EventMetadata";
import { normalizeMetadata } from "../utils/normalizeMetadata";

/**
 * Fluent builder for EventMetadata.
 */
export class EventMetadataBuilder {
  private tags: string[] = [];
  private attributes: Record<string, string | number | boolean> = {};

  withTag(tag: string): this {
    this.tags.push(tag);
    return this;
  }

  withTags(tags: readonly string[]): this {
    this.tags.push(...tags);
    return this;
  }

  withAttribute(key: string, value: string | number | boolean): this {
    this.attributes[key] = value;
    return this;
  }

  withAttributes(
    attributes: Readonly<Record<string, string | number | boolean>>,
  ): this {
    this.attributes = { ...this.attributes, ...attributes };
    return this;
  }

  build(): EventMetadata {
    return normalizeMetadata({
      tags: this.tags,
      attributes: this.attributes,
    });
  }
}
