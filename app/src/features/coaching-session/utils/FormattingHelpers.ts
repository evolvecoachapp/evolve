import type { SessionSummary } from "../models/SessionSummary";
import type { SessionStatus } from "../models/SessionState";

export function formatSessionHeadline(input: {
  readonly sessionId: string;
  readonly status: SessionStatus;
  readonly turnCount: number;
}): string {
  return `Coaching session ${input.sessionId} (${input.status}, ${input.turnCount} turns)`;
}

export function formatSummaryDetails(summary: SessionSummary): string {
  return [summary.headline, ...summary.details].join(" | ");
}
