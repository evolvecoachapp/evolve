export interface TimelineAttachment {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly destination: string | null;
}

export function createTimelineAttachment(input: TimelineAttachment): TimelineAttachment {
  return Object.freeze({ ...input });
}
