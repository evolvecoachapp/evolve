import type { TimelineCursor } from "./TimelineCursor";
import { createTimelineCursor } from "./TimelineCursor";

export interface TimelinePagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor: TimelineCursor | null;
  readonly previousCursor: TimelineCursor | null;
  readonly totalCount: number | null;
}

export function createTimelinePagination(input: TimelinePagination): TimelinePagination {
  return Object.freeze({
    ...input,
    nextCursor: input.nextCursor ? createTimelineCursor(input.nextCursor) : null,
    previousCursor: input.previousCursor ? createTimelineCursor(input.previousCursor) : null,
  });
}
