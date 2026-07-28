import type { AthleteWorkspace } from "../models/AthleteWorkspace";
import type { WorkspaceCoach } from "../models/WorkspaceCoach";
import type { WorkspaceInsights } from "../models/WorkspaceInsights";
import type { WorkspaceOverview } from "../models/WorkspaceOverview";
import type { WorkspaceResult, WorkspaceValidation } from "../models/WorkspaceResult";
import type { WorkspaceStatus } from "../models/WorkspaceStatus";
import type { WorkspaceTimeline } from "../models/WorkspaceTimeline";
import {
  createAthleteWorkspaceService,
  type AthleteWorkspaceService,
  type AthleteWorkspaceServiceDeps,
} from "../services/AthleteWorkspaceService";
import type { BuildAthleteWorkspaceInput } from "../services/buildAthleteWorkspace";

function resolveService(
  service: AthleteWorkspaceService | undefined,
  deps: AthleteWorkspaceServiceDeps | undefined,
): AthleteWorkspaceService {
  if (service) return service;
  return createAthleteWorkspaceService(deps ?? {});
}

/** Public API — compose the Athlete Intelligence Workspace from existing artifacts. */
export function composeAthleteWorkspace(options: {
  readonly input: Omit<
    BuildAthleteWorkspaceInput,
    | "generatedAt"
    | "version"
    | "homeExperience"
    | "dailyBrief"
    | "weeklyReport"
    | "timeline"
    | "latestDecisions"
    | "latestRestores"
    | "planHistory"
    | "insights"
    | "criticalFindings"
    | "coachingSession"
  > & {
    readonly generatedAt?: string;
    readonly homeExperience?: BuildAthleteWorkspaceInput["homeExperience"];
    readonly dailyBrief?: BuildAthleteWorkspaceInput["dailyBrief"];
    readonly weeklyReport?: BuildAthleteWorkspaceInput["weeklyReport"];
    readonly timeline?: BuildAthleteWorkspaceInput["timeline"];
    readonly latestDecisions?: BuildAthleteWorkspaceInput["latestDecisions"];
    readonly latestRestores?: BuildAthleteWorkspaceInput["latestRestores"];
    readonly planHistory?: BuildAthleteWorkspaceInput["planHistory"];
    readonly insights?: BuildAthleteWorkspaceInput["insights"];
    readonly criticalFindings?: BuildAthleteWorkspaceInput["criticalFindings"];
    readonly coachingSession?: BuildAthleteWorkspaceInput["coachingSession"];
  };
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — full Athlete Intelligence Workspace. */
export function getAthleteWorkspace(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): AthleteWorkspace | null {
  return resolveService(options.service, options.deps).getAthleteWorkspace(
    options.athleteId,
  );
}

/** Dashboard API — workspace overview. */
export function getWorkspaceOverview(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceOverview | null {
  return resolveService(options.service, options.deps).getWorkspaceOverview(
    options.athleteId,
  );
}

/** Dashboard API — workspace status. */
export function getWorkspaceStatus(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceStatus | null {
  return resolveService(options.service, options.deps).getWorkspaceStatus(
    options.athleteId,
  );
}

/** Dashboard API — workspace timeline. */
export function getWorkspaceTimeline(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceTimeline | null {
  return resolveService(options.service, options.deps).getWorkspaceTimeline(
    options.athleteId,
  );
}

/** Dashboard API — workspace insights. */
export function getWorkspaceInsights(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceInsights | null {
  return resolveService(options.service, options.deps).getWorkspaceInsights(
    options.athleteId,
  );
}

/** Dashboard API — workspace coach projection. */
export function getWorkspaceCoach(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceCoach | null {
  return resolveService(options.service, options.deps).getWorkspaceCoach(
    options.athleteId,
  );
}

/** Public API — validate latest Athlete Intelligence Workspace for athlete. */
export function validateAthleteWorkspaceForAthlete(options: {
  readonly athleteId: string;
  readonly service?: AthleteWorkspaceService;
  readonly deps?: AthleteWorkspaceServiceDeps;
}): WorkspaceValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { AthleteWorkspaceServiceDeps };
