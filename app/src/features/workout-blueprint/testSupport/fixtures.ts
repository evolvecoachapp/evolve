import type { TrainingBlock } from "../models/TrainingBlock";
import type { TrainingFocus } from "../models/TrainingFocus";
import type { TrainingPriority } from "../models/TrainingPriority";
import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type { WorkoutBlueprintAIOutput } from "../models/WorkoutBlueprintAIOutput";
import type { WorkoutBlueprintMetadata } from "../models/WorkoutBlueprintMetadata";
import type { WorkoutConstraint } from "../models/WorkoutConstraint";
import type { WorkoutDayBlueprint } from "../models/WorkoutDayBlueprint";
import type { WorkoutSplit } from "../models/WorkoutSplit";
import { freezeBlueprint } from "../utils/freezeBlueprint";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export function createTrainingPriority(
  overrides: Partial<TrainingPriority> = {},
): TrainingPriority {
  return Object.freeze({
    primary: overrides.primary ?? "hypertrophy",
    secondary:
      overrides.secondary !== undefined ? overrides.secondary : "strength",
  });
}

export function createTrainingFocus(
  overrides: Partial<TrainingFocus> = {},
): TrainingFocus {
  return Object.freeze({
    primary: overrides.primary ?? "upper_body",
    secondary:
      overrides.secondary !== undefined ? overrides.secondary : "pull",
  });
}

export function createWorkoutSplit(
  overrides: Partial<WorkoutSplit> = {},
): WorkoutSplit {
  return Object.freeze({
    type: overrides.type ?? "upper_lower",
    daysPerWeek: overrides.daysPerWeek ?? 4,
    cycleLengthDays: overrides.cycleLengthDays ?? 7,
  });
}

export function createWorkoutConstraint(
  overrides: Partial<WorkoutConstraint> = {},
): WorkoutConstraint {
  return Object.freeze({
    kind: overrides.kind ?? "time",
    code: overrides.code ?? "session_duration_60",
    severity: overrides.severity ?? "soft",
  });
}

export function createTrainingBlock(
  overrides: Partial<TrainingBlock> = {},
): TrainingBlock {
  return Object.freeze({
    id: overrides.id ?? "block-1",
    name: overrides.name ?? "primary",
    order: overrides.order ?? 0,
    weekCount: overrides.weekCount ?? 4,
    priority: overrides.priority
      ? createTrainingPriority(overrides.priority)
      : createTrainingPriority(),
    focus: overrides.focus
      ? createTrainingFocus(overrides.focus)
      : createTrainingFocus({ primary: "full_body", secondary: null }),
  });
}

export function createWorkoutDayBlueprint(
  overrides: Partial<WorkoutDayBlueprint> = {},
): WorkoutDayBlueprint {
  const isRestDay = overrides.isRestDay ?? false;
  return Object.freeze({
    id: overrides.id ?? "day-1",
    dayIndex: overrides.dayIndex ?? 0,
    name: overrides.name ?? (isRestDay ? "Rest" : "Upper A"),
    isRestDay,
    focus: overrides.focus
      ? createTrainingFocus(overrides.focus)
      : createTrainingFocus(
          isRestDay
            ? { primary: "full_body", secondary: null }
            : { primary: "upper_body", secondary: "push" },
        ),
    sessionGoal: overrides.sessionGoal ?? (isRestDay ? "rest" : "primary_lift_emphasis"),
    estimatedDurationMinutes:
      overrides.estimatedDurationMinutes !== undefined
        ? overrides.estimatedDurationMinutes
        : isRestDay
          ? null
          : 60,
  });
}

export function createWorkoutBlueprintMetadata(
  overrides: Partial<WorkoutBlueprintMetadata> = {},
): WorkoutBlueprintMetadata {
  return Object.freeze({
    version: overrides.version ?? "1.0.0",
    source: overrides.source ?? "ai",
    athleteId: overrides.athleteId !== undefined ? overrides.athleteId : "athlete-1",
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
    tags: Object.freeze(
      overrides.tags ? [...overrides.tags] : ["workout_blueprint"],
    ),
  });
}

export function createWorkoutBlueprint(
  overrides: Partial<WorkoutBlueprint> = {},
): WorkoutBlueprint {
  const split = overrides.split
    ? createWorkoutSplit(overrides.split)
    : createWorkoutSplit();

  const days =
    overrides.days ??
    Object.freeze([
      createWorkoutDayBlueprint({
        id: "day-1",
        dayIndex: 0,
        name: "Upper A",
        focus: { primary: "upper_body", secondary: "push" },
        sessionGoal: "primary_lift_emphasis",
      }),
      createWorkoutDayBlueprint({
        id: "day-2",
        dayIndex: 1,
        name: "Lower A",
        focus: { primary: "lower_body", secondary: "posterior_chain" },
        sessionGoal: "volume_accumulation",
      }),
      createWorkoutDayBlueprint({
        id: "day-3",
        dayIndex: 2,
        name: "Rest",
        isRestDay: true,
      }),
      createWorkoutDayBlueprint({
        id: "day-4",
        dayIndex: 3,
        name: "Upper B",
        focus: { primary: "upper_body", secondary: "pull" },
        sessionGoal: "volume_accumulation",
      }),
      createWorkoutDayBlueprint({
        id: "day-5",
        dayIndex: 4,
        name: "Lower B",
        focus: { primary: "lower_body", secondary: "legs" },
        sessionGoal: "primary_lift_emphasis",
      }),
      createWorkoutDayBlueprint({
        id: "day-6",
        dayIndex: 5,
        name: "Rest",
        isRestDay: true,
      }),
      createWorkoutDayBlueprint({
        id: "day-7",
        dayIndex: 6,
        name: "Rest",
        isRestDay: true,
      }),
    ]);

  return freezeBlueprint({
    id: overrides.id ?? "blueprint-1",
    split,
    priority: overrides.priority
      ? createTrainingPriority(overrides.priority)
      : createTrainingPriority(),
    focus: overrides.focus
      ? createTrainingFocus(overrides.focus)
      : createTrainingFocus({ primary: "full_body", secondary: null }),
    constraints: Object.freeze(
      overrides.constraints
        ? overrides.constraints.map((constraint) =>
            createWorkoutConstraint(constraint),
          )
        : [createWorkoutConstraint()],
    ),
    blocks: Object.freeze(
      overrides.blocks
        ? overrides.blocks.map((block) => createTrainingBlock(block))
        : [createTrainingBlock()],
    ),
    days: Object.freeze([...days]),
    weeklyFrequency: overrides.weeklyFrequency ?? split.daysPerWeek,
    metadata: overrides.metadata
      ? createWorkoutBlueprintMetadata(overrides.metadata)
      : createWorkoutBlueprintMetadata(),
  });
}

/**
 * Deterministic strategic AI output for builder/service tests.
 */
export function createWorkoutBlueprintAIOutput(
  overrides: Partial<WorkoutBlueprintAIOutput> = {},
): WorkoutBlueprintAIOutput {
  const blueprint = createWorkoutBlueprint();
  return Object.freeze({
    id: overrides.id ?? blueprint.id,
    split: overrides.split ?? blueprint.split,
    priority: overrides.priority ?? blueprint.priority,
    focus: overrides.focus ?? blueprint.focus,
    constraints: overrides.constraints ?? blueprint.constraints,
    blocks: overrides.blocks ?? blueprint.blocks,
    days: overrides.days ?? blueprint.days,
    weeklyFrequency: overrides.weeklyFrequency ?? blueprint.weeklyFrequency,
    metadata: overrides.metadata ?? blueprint.metadata,
  });
}
