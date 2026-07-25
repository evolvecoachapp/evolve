import type { AdaptationDecision } from "../models/AdaptationDecision";
import { AdaptationCategories } from "../models/AdaptationCategory";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import {
  freezeGoalHandoff,
  freezeNutritionHandoff,
  freezeRecoveryHandoff,
  freezeWorkoutHandoff,
} from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

function handoffBase(
  decisions: readonly AdaptationDecision[],
  categories: readonly string[],
) {
  const filtered = decisions.filter((d) => categories.includes(d.category));
  return {
    decisionIds: Object.freeze(filtered.map((d) => d.id)),
    signalKeys: uniqueSorted(filtered.flatMap((d) => d.signalKeys)),
    categoryKeys: uniqueSorted(filtered.map((d) => d.category)),
  };
}

/** Handoff inputs only — never modify plans. */
export function buildWorkoutAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): WorkoutAdaptationInput {
  const base = handoffBase(input.decisions, [
    AdaptationCategories.WORKOUT,
    AdaptationCategories.PERFORMANCE,
  ]);
  return freezeWorkoutHandoff({
    id: `handoff:workout:${input.contextId}`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function buildNutritionAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): NutritionAdaptationInput {
  const base = handoffBase(input.decisions, [AdaptationCategories.NUTRITION]);
  return freezeNutritionHandoff({
    id: `handoff:nutrition:${input.contextId}`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function buildRecoveryAdaptationInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): RecoveryAdaptationInput {
  const base = handoffBase(input.decisions, [AdaptationCategories.RECOVERY]);
  return freezeRecoveryHandoff({
    id: `handoff:recovery:${input.contextId}`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}

export function buildGoalProgressInput(input: {
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): GoalProgressInput {
  const base = handoffBase(input.decisions, [AdaptationCategories.GOAL]);
  return freezeGoalHandoff({
    id: `handoff:goal:${input.contextId}`,
    athleteId: input.athleteId,
    contextId: input.contextId,
    ...base,
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
