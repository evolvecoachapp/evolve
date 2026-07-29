export interface TimelineCursor {
  readonly value: string;
  readonly occurredAt: string;
}

export function createTimelineCursor(input: TimelineCursor): TimelineCursor {
  return Object.freeze({ ...input });
}
