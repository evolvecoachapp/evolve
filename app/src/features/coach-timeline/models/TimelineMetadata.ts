export interface TimelineMetadata {
  readonly sourceModule: string;
  readonly correlationId: string | null;
  readonly tags: readonly string[];
  readonly extras: Readonly<Record<string, string>>;
}

export function createTimelineMetadata(input: TimelineMetadata): TimelineMetadata {
  return Object.freeze({
    ...input,
    tags: Object.freeze([...input.tags]),
    extras: Object.freeze({ ...input.extras }),
  });
}
