export interface ExplanationPriority {
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: string;
}

export function priorityForOrdinal(ordinal: number): ExplanationPriority {
  return Object.freeze({
    ordinal,
    urgency: Math.max(0, 100 - ordinal * 10),
    label: ordinal === 0 ? "critical" : ordinal === 1 ? "high" : "normal",
  });
}
