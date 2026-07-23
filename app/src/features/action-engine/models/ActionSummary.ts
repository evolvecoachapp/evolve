/**
 * Compact immutable summary of an ActionPlan.
 */
export interface ActionSummary {
  readonly planId: string;
  readonly sourceResponseId: string;
  readonly intent: string;
  readonly stepCount: number;
  readonly dependencyCount: number;
  readonly priority: string;
  readonly status: string;
  readonly readyStepCount: number;
  readonly blockedStepCount: number;
  readonly complete: boolean;
}
