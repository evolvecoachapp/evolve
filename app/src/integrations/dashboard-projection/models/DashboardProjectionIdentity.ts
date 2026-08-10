/** Presentation identity inputs for Dashboard athlete header projection. */
export interface DashboardProjectionIdentity {
  readonly displayName: string;
  readonly initials: string;
  readonly now?: Date;
}

export function createDashboardProjectionIdentity(
  input: DashboardProjectionIdentity,
): DashboardProjectionIdentity {
  return Object.freeze({ ...input });
}
