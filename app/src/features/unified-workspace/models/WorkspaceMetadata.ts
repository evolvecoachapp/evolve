/**
 * Immutable metadata for the Unified Athlete Workspace.
 */
export interface WorkspaceMetadata {
  readonly generatedAt: string;
  readonly version: string;
  readonly workspaceId: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly schemaVersion: string;
}
