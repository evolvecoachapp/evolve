import type { AgentMetadata } from "../models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import { freezeMetadata } from "./FreezeAgent";

export function createMetadata(
  tags: readonly string[] = [],
  attributes: Readonly<
    Record<string, string | number | boolean | null>
  > = {},
): AgentMetadata {
  return freezeMetadata({
    tags: Object.freeze([...tags]),
    attributes: Object.freeze({ ...attributes }),
  });
}

export function mergeMetadata(
  base: AgentMetadata,
  override: Partial<AgentMetadata> | null | undefined,
): AgentMetadata {
  if (!override) {
    return freezeMetadata(base);
  }
  return freezeMetadata({
    tags: Object.freeze([
      ...base.tags,
      ...(override.tags ?? []),
    ]),
    attributes: Object.freeze({
      ...base.attributes,
      ...(override.attributes ?? {}),
    }),
  });
}

export function emptyMetadata(): AgentMetadata {
  return EMPTY_AGENT_METADATA;
}

export function hasTag(metadata: AgentMetadata, tag: string): boolean {
  return metadata.tags.includes(tag);
}
