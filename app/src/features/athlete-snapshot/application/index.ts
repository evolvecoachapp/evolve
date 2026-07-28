import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { SnapshotCoach } from "../models/SnapshotCoach";
import type { SnapshotIdentity } from "../models/SnapshotIdentity";
import type { SnapshotIntegrity } from "../models/SnapshotIntegrity";
import type { SnapshotResult } from "../models/SnapshotResult";
import type { SnapshotState } from "../models/SnapshotState";
import type { SnapshotTimeline } from "../models/SnapshotTimeline";
import type { SnapshotWorkspace } from "../models/SnapshotWorkspace";
import {
  createAthleteSnapshotService,
  type AthleteSnapshotService,
  type AthleteSnapshotServiceDeps,
} from "../services/AthleteSnapshotService";
import type { BuildAthleteSnapshotInput } from "../services/buildAthleteSnapshot";

function resolveService(
  service: AthleteSnapshotService | undefined,
  deps: AthleteSnapshotServiceDeps | undefined,
): AthleteSnapshotService {
  if (service) return service;
  return createAthleteSnapshotService(deps ?? {});
}

/** Public API — compose the Athlete Snapshot from existing artifacts. */
export function composeAthleteSnapshot(options: {
  readonly input: Omit<
    BuildAthleteSnapshotInput,
    | "createdAt"
    | "workspace"
    | "timeline"
    | "latestEvents"
    | "latestDecisions"
    | "latestRestores"
    | "coachingSession"
    | "weeklyReport"
    | "applicationVersion"
    | "schemaVersion"
    | "snapshotVersion"
  > & {
    readonly createdAt?: string;
    readonly workspace?: BuildAthleteSnapshotInput["workspace"];
    readonly timeline?: BuildAthleteSnapshotInput["timeline"];
    readonly latestEvents?: BuildAthleteSnapshotInput["latestEvents"];
    readonly latestDecisions?: BuildAthleteSnapshotInput["latestDecisions"];
    readonly latestRestores?: BuildAthleteSnapshotInput["latestRestores"];
    readonly coachingSession?: BuildAthleteSnapshotInput["coachingSession"];
    readonly weeklyReport?: BuildAthleteSnapshotInput["weeklyReport"];
  };
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — full current athlete snapshot. */
export function getCurrentSnapshot(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): AthleteSnapshot | null {
  return resolveService(options.service, options.deps).getCurrentSnapshot(
    options.athleteId,
  );
}

/** Dashboard API — snapshot identity. */
export function getSnapshotIdentity(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotIdentity | null {
  return resolveService(options.service, options.deps).getSnapshotIdentity(
    options.athleteId,
  );
}

/** Dashboard API — snapshot state projection. */
export function getSnapshotState(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotState | null {
  return resolveService(options.service, options.deps).getSnapshotState(
    options.athleteId,
  );
}

/** Dashboard API — snapshot workspace projection. */
export function getSnapshotWorkspace(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotWorkspace | null {
  return resolveService(options.service, options.deps).getSnapshotWorkspace(
    options.athleteId,
  );
}

/** Dashboard API — snapshot timeline projection. */
export function getSnapshotTimeline(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotTimeline | null {
  return resolveService(options.service, options.deps).getSnapshotTimeline(
    options.athleteId,
  );
}

/** Dashboard API — snapshot coach projection. */
export function getSnapshotCoach(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotCoach | null {
  return resolveService(options.service, options.deps).getSnapshotCoach(
    options.athleteId,
  );
}

/** Public API — validate latest Athlete Snapshot for athlete. */
export function validateAthleteSnapshotForAthlete(options: {
  readonly athleteId: string;
  readonly service?: AthleteSnapshotService;
  readonly deps?: AthleteSnapshotServiceDeps;
}): SnapshotIntegrity {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { AthleteSnapshotServiceDeps };
