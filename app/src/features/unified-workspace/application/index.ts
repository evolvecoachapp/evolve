import type { Workspace } from "../models/Workspace";
import type { WorkspaceCoach } from "../models/WorkspaceCoach";
import type { WorkspaceHealth } from "../models/WorkspaceHealth";
import type { WorkspaceInsights } from "../models/WorkspaceInsights";
import type {
  WorkspaceResult,
  WorkspaceValidation,
} from "../models/WorkspaceResult";
import type { WorkspaceSummary } from "../models/WorkspaceSummary";
import {
  createUnifiedWorkspaceService,
  type UnifiedWorkspaceService,
  type UnifiedWorkspaceServiceDeps,
} from "../services/UnifiedWorkspaceService";
import type { BuildUnifiedWorkspaceInput } from "../services/buildUnifiedWorkspace";

function resolveService(
  service: UnifiedWorkspaceService | undefined,
  deps: UnifiedWorkspaceServiceDeps | undefined,
): UnifiedWorkspaceService {
  if (service) return service;
  return createUnifiedWorkspaceService(deps ?? {});
}

/** Public API — compose the Unified Athlete Workspace from existing artifacts. */
export function composeUnifiedWorkspace(options: {
  readonly input: Omit<
    BuildUnifiedWorkspaceInput,
    | "generatedAt"
    | "version"
    | "schemaVersion"
    | "homeExperience"
    | "dailyBrief"
    | "weeklyReport"
    | "timeline"
    | "latestEvents"
    | "latestDecisions"
    | "latestRestores"
    | "insights"
    | "criticalFindings"
    | "coachingSession"
    | "snapshot"
  > & {
    readonly generatedAt?: string;
    readonly homeExperience?: BuildUnifiedWorkspaceInput["homeExperience"];
    readonly dailyBrief?: BuildUnifiedWorkspaceInput["dailyBrief"];
    readonly weeklyReport?: BuildUnifiedWorkspaceInput["weeklyReport"];
    readonly timeline?: BuildUnifiedWorkspaceInput["timeline"];
    readonly latestEvents?: BuildUnifiedWorkspaceInput["latestEvents"];
    readonly latestDecisions?: BuildUnifiedWorkspaceInput["latestDecisions"];
    readonly latestRestores?: BuildUnifiedWorkspaceInput["latestRestores"];
    readonly insights?: BuildUnifiedWorkspaceInput["insights"];
    readonly criticalFindings?: BuildUnifiedWorkspaceInput["criticalFindings"];
    readonly coachingSession?: BuildUnifiedWorkspaceInput["coachingSession"];
    readonly snapshot?: BuildUnifiedWorkspaceInput["snapshot"];
  };
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): WorkspaceResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — full Unified Athlete Workspace. */
export function getWorkspace(options: {
  readonly athleteId: string;
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): Workspace | null {
  return resolveService(options.service, options.deps).getWorkspace(
    options.athleteId,
  );
}

/** Dashboard API — workspace summary. */
export function getWorkspaceSummary(options: {
  readonly athleteId: string;
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): WorkspaceSummary | null {
  return resolveService(options.service, options.deps).getWorkspaceSummary(
    options.athleteId,
  );
}

/** Dashboard API — workspace health. */
export function getWorkspaceHealth(options: {
  readonly athleteId: string;
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): WorkspaceHealth | null {
  return resolveService(options.service, options.deps).getWorkspaceHealth(
    options.athleteId,
  );
}

/** Dashboard API — workspace insights. */
export function getWorkspaceInsights(options: {
  readonly athleteId: string;
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): WorkspaceInsights | null {
  return resolveService(options.service, options.deps).getWorkspaceInsights(
    options.athleteId,
  );
}

/** Dashboard API — workspace coach projection. */
export function getWorkspaceCoach(options: {
  readonly athleteId: string;
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): WorkspaceCoach | null {
  return resolveService(options.service, options.deps).getWorkspaceCoach(
    options.athleteId,
  );
}

/** Public API — validate latest Unified Athlete Workspace for athlete. */
export function validateUnifiedWorkspaceForAthlete(options: {
  readonly athleteId: string;
  readonly service?: UnifiedWorkspaceService;
  readonly deps?: UnifiedWorkspaceServiceDeps;
}): WorkspaceValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { UnifiedWorkspaceServiceDeps };
