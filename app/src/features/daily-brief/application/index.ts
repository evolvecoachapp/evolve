import type { DailyBrief } from "../models/DailyBrief";
import type { DailyBriefCoachMessage } from "../models/DailyBriefCoachMessage";
import type { DailyBriefGoals } from "../models/DailyBriefGoals";
import type { DailyBriefInsights } from "../models/DailyBriefInsights";
import type { DailyBriefNutrition } from "../models/DailyBriefNutrition";
import type { DailyBriefRecovery } from "../models/DailyBriefRecovery";
import type {
  DailyBriefResult,
  DailyBriefValidation,
} from "../models/DailyBriefResult";
import type { DailyBriefWorkout } from "../models/DailyBriefWorkout";
import type { BuildDailyBriefInput } from "../services/buildDailyBrief";
import {
  createDailyBriefService,
  type DailyBriefService,
  type DailyBriefServiceDeps,
} from "../services/DailyBriefService";

function resolveService(
  service: DailyBriefService | undefined,
  deps: DailyBriefServiceDeps | undefined,
): DailyBriefService {
  if (service) return service;
  return createDailyBriefService(deps ?? {});
}

/** Public API — compose Athlete Daily Brief from existing coaching knowledge. */
export function composeDailyBrief(options: {
  readonly input: Omit<
    BuildDailyBriefInput,
    | "generatedAt"
    | "timelineEntries"
    | "insights"
    | "coachingSession"
    | "planHistory"
  > & {
    readonly generatedAt?: string;
    readonly timelineEntries?: BuildDailyBriefInput["timelineEntries"];
    readonly insights?: BuildDailyBriefInput["insights"];
    readonly coachingSession?: BuildDailyBriefInput["coachingSession"];
    readonly planHistory?: BuildDailyBriefInput["planHistory"];
    readonly planLineageId?: string | null;
    readonly goalSignals?: readonly string[];
  };
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Dashboard API — full Daily Brief. */
export function getDailyBrief(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBrief | null {
  return resolveService(options.service, options.deps).getDailyBrief(
    options.athleteId,
  );
}

/** Dashboard API — coach message. */
export function getCoachMessage(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefCoachMessage | null {
  return resolveService(options.service, options.deps).getCoachMessage(
    options.athleteId,
  );
}

/** Dashboard API — workout section. */
export function getWorkoutSection(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefWorkout | null {
  return resolveService(options.service, options.deps).getWorkoutSection(
    options.athleteId,
  );
}

/** Dashboard API — nutrition section. */
export function getNutritionSection(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefNutrition | null {
  return resolveService(options.service, options.deps).getNutritionSection(
    options.athleteId,
  );
}

/** Dashboard API — recovery section. */
export function getRecoverySection(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefRecovery | null {
  return resolveService(options.service, options.deps).getRecoverySection(
    options.athleteId,
  );
}

/** Dashboard API — goal section. */
export function getGoalSection(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefGoals | null {
  return resolveService(options.service, options.deps).getGoalSection(
    options.athleteId,
  );
}

/** Dashboard API — insight section. */
export function getInsightSection(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefInsights | null {
  return resolveService(options.service, options.deps).getInsightSection(
    options.athleteId,
  );
}

/** Public API — validate latest Daily Brief for athlete. */
export function validateDailyBriefForAthlete(options: {
  readonly athleteId: string;
  readonly service?: DailyBriefService;
  readonly deps?: DailyBriefServiceDeps;
}): DailyBriefValidation {
  return resolveService(options.service, options.deps).validate(
    options.athleteId,
  );
}

export type { DailyBriefServiceDeps };
