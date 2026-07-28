import type { AthleteWorkspace } from "./AthleteWorkspace";
import type { WorkspaceMetadata } from "./WorkspaceMetadata";
import type { WorkspaceOverview } from "./WorkspaceOverview";

export interface WorkspaceValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building the workspace.
 */
export interface WorkspaceResult {
  readonly id: string;
  readonly success: boolean;
  readonly workspace: AthleteWorkspace | null;
  readonly overview: WorkspaceOverview | null;
  readonly metadata: WorkspaceMetadata | null;
  readonly validation: WorkspaceValidation;
  readonly message: string;
  readonly generatedAt: string;
}
