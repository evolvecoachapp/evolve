import type { RecoveryIndicators } from "../models/RecoveryIndicators";
import type { RecoveryScore, RecoveryScoreLabel } from "../models/RecoveryScore";
import type { ReadinessState } from "../models/ReadinessState";
import type { DeloadRecommendation } from "../models/DeloadRecommendation";
import type { RecoveryRequest } from "../models/RecoveryRequest";
import { buildFatigueState } from "./FatigueHelpers";
import { buildSleepProfile } from "./SleepHelpers";
import { buildStressProfile } from "./StressHelpers";
import { buildTrainingLoad } from "./TrainingLoadHelpers";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function recoveryScoreLabel(score: number): RecoveryScoreLabel {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export function readinessLabel(
  score: number,
): ReadinessState["label"] {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export function buildReadinessState(
  score: number,
  notes: readonly string[] = [],
): ReadinessState {
  return Object.freeze({
    score: clamp(score),
    label: readinessLabel(score),
    notes: Object.freeze([...notes]),
  });
}

export function computeRecoveryScore(components: {
  readonly sleepQuality: number;
  readonly stressLevel: number;
  readonly fatigueLevel: number;
  readonly sorenessLevel: number;
  readonly readinessScore: number;
  readonly trainingLoadScore: number;
  readonly hrvScore: number | null;
}): RecoveryScore {
  const invertedStress = 100 - components.stressLevel;
  const invertedFatigue = 100 - components.fatigueLevel;
  const invertedSoreness = 100 - components.sorenessLevel;
  const invertedLoad = 100 - components.trainingLoadScore;
  const hrv = components.hrvScore ?? components.readinessScore;
  const score = clamp(
    components.sleepQuality * 0.2 +
      invertedStress * 0.15 +
      invertedFatigue * 0.2 +
      invertedSoreness * 0.1 +
      components.readinessScore * 0.2 +
      invertedLoad * 0.1 +
      hrv * 0.05,
  );
  return Object.freeze({
    score,
    label: recoveryScoreLabel(score),
    components: Object.freeze({
      sleepQuality: components.sleepQuality,
      stressInverted: invertedStress,
      fatigueInverted: invertedFatigue,
      sorenessInverted: invertedSoreness,
      readiness: components.readinessScore,
      loadInverted: invertedLoad,
      hrv,
    }),
  });
}

export function buildIndicatorsFromRequest(
  request: RecoveryRequest,
): RecoveryIndicators {
  const sleepQuality = request.sleepQuality ?? 60;
  const stressLevel = request.stressLevel ?? 40;
  const fatigueLevel = request.fatigueLevel ?? 40;
  const sorenessLevel = request.sorenessLevel ?? 30;
  const trainingLoadScore = request.trainingLoadHint ?? 45;
  const readinessScore =
    request.readinessHint ??
    clamp(
      100 -
        fatigueLevel * 0.4 -
        stressLevel * 0.3 -
        sorenessLevel * 0.2 +
        sleepQuality * 0.1,
    );
  const recovery = computeRecoveryScore({
    sleepQuality,
    stressLevel,
    fatigueLevel,
    sorenessLevel,
    readinessScore,
    trainingLoadScore,
    hrvScore: request.hrvScore,
  });
  return Object.freeze({
    sleepQuality: clamp(sleepQuality),
    stressLevel: clamp(stressLevel),
    fatigueLevel: clamp(fatigueLevel),
    sorenessLevel: clamp(sorenessLevel),
    hrvScore: request.hrvScore,
    readinessScore: clamp(readinessScore),
    trainingLoadScore: clamp(trainingLoadScore),
    recoveryScore: recovery.score,
  });
}

export function buildDeloadRecommendation(input: {
  readonly recoveryScore: number;
  readonly fatigueLevel: number;
  readonly trainingLoadScore: number;
  readonly avoidDeload: boolean;
}): DeloadRecommendation {
  if (input.avoidDeload) {
    return Object.freeze({
      recommended: false,
      intensity: "none" as const,
      rationale: "Deload avoided by constraint.",
      durationDays: 0,
    });
  }
  const needs =
    input.recoveryScore < 45 ||
    input.fatigueLevel >= 75 ||
    input.trainingLoadScore >= 80;
  if (!needs) {
    return Object.freeze({
      recommended: false,
      intensity: "none" as const,
      rationale: "Recovery markers within tolerance.",
      durationDays: 0,
    });
  }
  const intensity =
    input.recoveryScore < 30 || input.fatigueLevel >= 90
      ? ("full" as const)
      : input.recoveryScore < 45
        ? ("moderate" as const)
        : ("light" as const);
  return Object.freeze({
    recommended: true,
    intensity,
    rationale: "Elevated fatigue / load or low recovery score.",
    durationDays: intensity === "full" ? 7 : intensity === "moderate" ? 5 : 3,
  });
}

export function deriveStatesFromIndicators(indicators: RecoveryIndicators) {
  return Object.freeze({
    fatigue: buildFatigueState(indicators.fatigueLevel),
    readiness: buildReadinessState(indicators.readinessScore),
    sleep: buildSleepProfile(7, indicators.sleepQuality),
    stress: buildStressProfile(indicators.stressLevel),
    trainingLoad: buildTrainingLoad(indicators.trainingLoadScore),
    recoveryScore: computeRecoveryScore({
      sleepQuality: indicators.sleepQuality,
      stressLevel: indicators.stressLevel,
      fatigueLevel: indicators.fatigueLevel,
      sorenessLevel: indicators.sorenessLevel,
      readinessScore: indicators.readinessScore,
      trainingLoadScore: indicators.trainingLoadScore,
      hrvScore: indicators.hrvScore,
    }),
  });
}
