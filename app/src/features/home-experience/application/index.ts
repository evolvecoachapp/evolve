import type { HomeCoachCard } from "../models/HomeCoachCard";
import type { HomeExperience } from "../models/HomeExperience";
import type {
  HomeExperienceResult,
  HomeExperienceValidation,
} from "../models/HomeExperienceResult";
import type { HomeInsightCard } from "../models/HomeInsightCard";
import type { HomeQuickAction } from "../models/HomeQuickAction";
import type { HomeSummary } from "../models/HomeSummary";
import type { BuildHomeExperienceInput } from "../services/buildHomeExperience";
import {
  createHomeExperienceService,
  type HomeExperienceService,
  type HomeExperienceServiceDeps,
} from "../services/HomeExperienceService";

function resolveService(
  service: HomeExperienceService | undefined,
  deps: HomeExperienceServiceDeps | undefined,
): HomeExperienceService {
  if (service) return service;
  return createHomeExperienceService(deps ?? {});
}

/** Public API — compose Home Experience from existing coaching knowledge. */
export function composeHomeExperience(options: {
  readonly input: Omit<
    BuildHomeExperienceInput,
    | "generatedAt"
    | "timelineEntries"
    | "insights"
    | "coachingSession"
    | "planHistory"
    | "canRestorePlan"
  > & {
    readonly generatedAt?: string;
    readonly timelineEntries?: BuildHomeExperienceInput["timelineEntries"];
    readonly insights?: BuildHomeExperienceInput["insights"];
    readonly coachingSession?: BuildHomeExperienceInput["coachingSession"];
    readonly planHistory?: BuildHomeExperienceInput["planHistory"];
    readonly planLineageId?: string | null;
    readonly canRestorePlan?: boolean;
    readonly goalSignals?: readonly string[];
  };
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): HomeExperienceResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — full Home Experience. */
export function getHomeExperience(options: {
  readonly athleteId: string;
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): HomeExperience | null {
  return resolveService(options.service, options.deps).getHomeExperience(
    options.athleteId,
  );
}

/** Dashboard API — Home summary. */
export function getHomeSummary(options: {
  readonly athleteId: string;
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): HomeSummary | null {
  return resolveService(options.service, options.deps).getHomeSummary(
    options.athleteId,
  );
}

/** Dashboard API — quick actions. */
export function getQuickActions(options: {
  readonly athleteId: string;
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): readonly HomeQuickAction[] {
  return resolveService(options.service, options.deps).getQuickActions(
    options.athleteId,
  );
}

/** Dashboard API — coach card. */
export function getCoachCard(options: {
  readonly athleteId: string;
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): HomeCoachCard | null {
  return resolveService(options.service, options.deps).getCoachCard(
    options.athleteId,
  );
}

/** Dashboard API — insight cards. */
export function getInsightCards(options: {
  readonly athleteId: string;
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): readonly HomeInsightCard[] {
  return resolveService(options.service, options.deps).getInsightCards(
    options.athleteId,
  );
}

/** Public API — validate latest Home Experience for athlete. */
export function validateHomeExperienceForAthlete(options: {
  readonly athleteId: string;
  readonly service?: HomeExperienceService;
  readonly deps?: HomeExperienceServiceDeps;
}): HomeExperienceValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { HomeExperienceServiceDeps };
