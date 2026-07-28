import type { Workspace } from "./Workspace";
import type { WorkspaceMetadata } from "./WorkspaceMetadata";
import type { WorkspaceSummary } from "./WorkspaceSummary";

export interface WorkspaceValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building the Unified Athlete Workspace.
 */
export interface WorkspaceResult {
  readonly id: string;
  readonly success: boolean;
  readonly workspace: Workspace | null;
  readonly summary: WorkspaceSummary | null;
  readonly metadata: WorkspaceMetadata | null;
  readonly validation: WorkspaceValidation;
  readonly message: string;
  readonly generatedAt: string;
}
