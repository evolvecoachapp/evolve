/** Projector diagnostic snapshot for Dashboard projection state. */
export interface DashboardProjectionSnapshot {
  readonly projectedWorkspaceCount: number;
  readonly lastWorkspaceId: string | null;
  readonly lastAthleteId: string | null;
  readonly lastHeadline: string | null;
  readonly capturedAt: string;
}

export function createDashboardProjectionSnapshot(
  input: DashboardProjectionSnapshot,
): DashboardProjectionSnapshot {
  return Object.freeze({ ...input });
}
