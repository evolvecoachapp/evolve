import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";

/**
 * Proactive insight projection for the workspace.
 */
export interface WorkspaceInsights {
  readonly athleteId: string;
  readonly present: boolean;
  readonly insights: readonly CoachInsight[];
  readonly currentPatterns: readonly string[];
  readonly criticalFindings: readonly CoachInsight[];
  readonly summary: string;
}
