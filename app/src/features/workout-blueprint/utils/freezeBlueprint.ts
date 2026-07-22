import type { TrainingBlock } from "../models/TrainingBlock";
import type { TrainingFocus } from "../models/TrainingFocus";
import type { TrainingPriority } from "../models/TrainingPriority";
import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type { WorkoutBlueprintMetadata } from "../models/WorkoutBlueprintMetadata";
import type { WorkoutConstraint } from "../models/WorkoutConstraint";
import type { WorkoutDayBlueprint } from "../models/WorkoutDayBlueprint";
import type { WorkoutSplit } from "../models/WorkoutSplit";

/**
 * Deep-freeze a WorkoutBlueprint tree.
 */
export function freezeBlueprint(blueprint: WorkoutBlueprint): WorkoutBlueprint {
  return deepFreeze(cloneBlueprint(blueprint)) as WorkoutBlueprint;
}

function cloneBlueprint(blueprint: WorkoutBlueprint): WorkoutBlueprint {
  return {
    id: blueprint.id,
    split: cloneSplit(blueprint.split),
    priority: clonePriority(blueprint.priority),
    focus: cloneFocus(blueprint.focus),
    constraints: blueprint.constraints.map(cloneConstraint),
    blocks: blueprint.blocks.map(cloneBlock),
    days: blueprint.days.map(cloneDay),
    weeklyFrequency: blueprint.weeklyFrequency,
    metadata: cloneMetadata(blueprint.metadata),
  };
}

function cloneSplit(split: WorkoutSplit): WorkoutSplit {
  return {
    type: split.type,
    daysPerWeek: split.daysPerWeek,
    cycleLengthDays: split.cycleLengthDays,
  };
}

function clonePriority(priority: TrainingPriority): TrainingPriority {
  return {
    primary: priority.primary,
    secondary: priority.secondary,
  };
}

function cloneFocus(focus: TrainingFocus): TrainingFocus {
  return {
    primary: focus.primary,
    secondary: focus.secondary,
  };
}

function cloneConstraint(constraint: WorkoutConstraint): WorkoutConstraint {
  return {
    kind: constraint.kind,
    code: constraint.code,
    severity: constraint.severity,
  };
}

function cloneBlock(block: TrainingBlock): TrainingBlock {
  return {
    id: block.id,
    name: block.name,
    order: block.order,
    weekCount: block.weekCount,
    priority: clonePriority(block.priority),
    focus: cloneFocus(block.focus),
  };
}

function cloneDay(day: WorkoutDayBlueprint): WorkoutDayBlueprint {
  return {
    id: day.id,
    dayIndex: day.dayIndex,
    name: day.name,
    isRestDay: day.isRestDay,
    focus: cloneFocus(day.focus),
    sessionGoal: day.sessionGoal,
    estimatedDurationMinutes: day.estimatedDurationMinutes,
  };
}

function cloneMetadata(
  metadata: WorkoutBlueprintMetadata,
): WorkoutBlueprintMetadata {
  return {
    version: metadata.version,
    source: metadata.source,
    athleteId: metadata.athleteId,
    createdAt: metadata.createdAt,
    tags: [...metadata.tags],
  };
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const child = record[key];
    if (child !== null && typeof child === "object") {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
}
