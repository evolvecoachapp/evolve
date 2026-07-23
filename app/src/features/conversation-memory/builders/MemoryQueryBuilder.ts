import type { MemoryCategory } from "../models/MemoryCategory";
import type { MemoryPriority } from "../models/MemoryPriority";
import type { MemoryQuery } from "../models/MemoryQuery";
import {
  MemoryQueryModes,
  type MemoryQueryMode,
} from "../models/MemoryQuery";
import type { MemoryScope } from "../models/MemoryScope";
import { freezeQuery } from "../utils/FreezeMemoryState";

export interface MemoryQueryBuilderInput {
  readonly id: string;
  readonly createdAt: string;
  readonly mode?: MemoryQueryMode;
  readonly category?: MemoryCategory | null;
  readonly identifierId?: string | null;
  readonly key?: string | null;
  readonly scope?: MemoryScope | null;
  readonly minPriority?: MemoryPriority | null;
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly fromTime?: string | null;
  readonly toTime?: string | null;
  readonly limit?: number | null;
  readonly latestOnly?: boolean;
  readonly historical?: boolean;
}

/**
 * Builds an immutable MemoryQuery.
 */
export class MemoryQueryBuilder {
  build(input: MemoryQueryBuilderInput): MemoryQuery {
    const mode = input.mode ?? MemoryQueryModes.BY_CATEGORY;
    return freezeQuery({
      id: input.id,
      mode,
      category: input.category ?? null,
      identifierId: input.identifierId ?? null,
      key: input.key ?? null,
      scope: input.scope ?? null,
      minPriority: input.minPriority ?? null,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      sessionId: input.sessionId ?? null,
      fromTime: input.fromTime ?? null,
      toTime: input.toTime ?? null,
      limit: input.limit ?? null,
      latestOnly: input.latestOnly ?? mode === MemoryQueryModes.LATEST,
      historical: input.historical ?? mode === MemoryQueryModes.HISTORICAL,
      createdAt: input.createdAt,
    });
  }
}

export function buildMemoryQuery(
  input: MemoryQueryBuilderInput,
): MemoryQuery {
  return new MemoryQueryBuilder().build(input);
}
