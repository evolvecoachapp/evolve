import type { SessionStatistics } from "./SessionStatistics";

export interface SessionSummary {
  readonly id: string;
  readonly sessionId: string;
  readonly headline: string;
  readonly details: readonly string[];
  readonly statistics: SessionStatistics;
  readonly createdAt: string;
}
