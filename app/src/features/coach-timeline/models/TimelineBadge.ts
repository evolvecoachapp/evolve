export interface TimelineBadge {
  readonly id: string;
  readonly label: string;
  readonly tone: string;
}

export function createTimelineBadge(input: TimelineBadge): TimelineBadge {
  return Object.freeze({ ...input });
}
