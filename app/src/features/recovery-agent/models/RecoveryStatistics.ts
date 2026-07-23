export interface RecoveryAgentStatistics {
  readonly reasoningCount: number;
  readonly plannerCount: number;
  readonly recommendationCount: number;
  readonly issueCount: number;
  readonly durationMs: number;
  readonly recoveryScore: number;
  readonly readinessScore: number;
  readonly fatigueLevel: number;
}

export type RecoveryStatistics = RecoveryAgentStatistics;
