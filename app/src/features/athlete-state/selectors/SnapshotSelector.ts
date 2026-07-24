import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { StateVersion } from "../models/StateVersion";
import { versionsEqual } from "../utils/VersionHelpers";

export function selectSnapshotByVersion(
  snapshots: readonly AthleteSnapshot[],
  version: StateVersion,
): AthleteSnapshot | null {
  return snapshots.find((s) => versionsEqual(s.version, version)) ?? null;
}

export function selectLatestSnapshot(
  snapshots: readonly AthleteSnapshot[],
): AthleteSnapshot | null {
  return snapshots[snapshots.length - 1] ?? null;
}
