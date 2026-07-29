export interface TimelineAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly destination: string | null;
}

export function createTimelineAction(input: TimelineAction): TimelineAction {
  return Object.freeze({ ...input });
}
