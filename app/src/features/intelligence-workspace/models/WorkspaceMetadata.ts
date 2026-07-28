/**
 * Immutable workspace metadata.
 */
export interface WorkspaceMetadata {
  readonly generatedAt: string;
  readonly version: string;
  readonly workspaceId: string;
  readonly weekStart: string;
  readonly weekEnd: string;
}
