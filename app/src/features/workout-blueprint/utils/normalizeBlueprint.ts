import type { SessionGoalCode } from "../models/SessionGoal";
import { SESSION_GOAL_CODES } from "../models/SessionGoal";
import type { TrainingBlock } from "../models/TrainingBlock";
import type { TrainingFocus, TrainingFocusArea } from "../models/TrainingFocus";
import { TRAINING_FOCUS_AREAS } from "../models/TrainingFocus";
import type {
  TrainingPriority,
  TrainingPriorityCode,
} from "../models/TrainingPriority";
import { TRAINING_PRIORITY_CODES } from "../models/TrainingPriority";
import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type {
  WorkoutBlueprintMetadata,
  WorkoutBlueprintSource,
} from "../models/WorkoutBlueprintMetadata";
import { WORKOUT_BLUEPRINT_SOURCES } from "../models/WorkoutBlueprintMetadata";
import type {
  WorkoutConstraint,
  WorkoutConstraintKind,
  WorkoutConstraintSeverity,
} from "../models/WorkoutConstraint";
import {
  WORKOUT_CONSTRAINT_KINDS,
  WORKOUT_CONSTRAINT_SEVERITIES,
} from "../models/WorkoutConstraint";
import type { WorkoutDayBlueprint } from "../models/WorkoutDayBlueprint";
import type { WorkoutSplit, WorkoutSplitType } from "../models/WorkoutSplit";
import { WORKOUT_SPLIT_TYPES } from "../models/WorkoutSplit";
import { freezeBlueprint } from "./freezeBlueprint";

export interface NormalizeBlueprintOptions {
  readonly id?: string;
  readonly createdAt?: string;
  readonly athleteId?: string | null;
  readonly source?: WorkoutBlueprintSource;
}

/**
 * Normalize a partial/raw blueprint into a complete WorkoutBlueprint shape.
 *
 * Fills defaults for missing strategic fields. Does not validate.
 */
export function normalizeBlueprint(
  input: unknown,
  options: NormalizeBlueprintOptions = {},
): WorkoutBlueprint {
  const raw =
    input !== null && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const split = normalizeSplit(raw.split);
  const days = normalizeDays(raw.days, split);
  const weeklyFrequency =
    typeof raw.weeklyFrequency === "number" &&
    Number.isInteger(raw.weeklyFrequency) &&
    raw.weeklyFrequency >= 1 &&
    raw.weeklyFrequency <= 7
      ? raw.weeklyFrequency
      : split.daysPerWeek;

  const blueprint: WorkoutBlueprint = {
    id:
      typeof options.id === "string" && options.id.trim().length > 0
        ? options.id.trim()
        : typeof raw.id === "string" && raw.id.trim().length > 0
          ? raw.id.trim()
          : createId("wbp"),
    split,
    priority: normalizePriority(raw.priority),
    focus: normalizeFocus(raw.focus),
    constraints: normalizeConstraints(raw.constraints),
    blocks: normalizeBlocks(raw.blocks),
    days,
    weeklyFrequency,
    metadata: normalizeMetadata(raw.metadata, options),
  };

  return freezeBlueprint(blueprint);
}

function normalizeSplit(value: unknown): WorkoutSplit {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const type =
    typeof raw.type === "string" &&
    (WORKOUT_SPLIT_TYPES as readonly string[]).includes(raw.type)
      ? (raw.type as WorkoutSplitType)
      : "upper_lower";

  const daysPerWeek =
    typeof raw.daysPerWeek === "number" &&
    Number.isInteger(raw.daysPerWeek) &&
    raw.daysPerWeek >= 1 &&
    raw.daysPerWeek <= 7
      ? raw.daysPerWeek
      : defaultDaysPerWeek(type);

  const cycleLengthDays =
    typeof raw.cycleLengthDays === "number" &&
    Number.isInteger(raw.cycleLengthDays) &&
    raw.cycleLengthDays >= 1 &&
    raw.cycleLengthDays <= 14
      ? raw.cycleLengthDays
      : 7;

  return { type, daysPerWeek, cycleLengthDays };
}

function normalizePriority(value: unknown): TrainingPriority {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const primary =
    typeof raw.primary === "string" &&
    (TRAINING_PRIORITY_CODES as readonly string[]).includes(raw.primary)
      ? (raw.primary as TrainingPriorityCode)
      : "hypertrophy";

  const secondary =
    raw.secondary === null
      ? null
      : typeof raw.secondary === "string" &&
          (TRAINING_PRIORITY_CODES as readonly string[]).includes(raw.secondary)
        ? (raw.secondary as TrainingPriorityCode)
        : null;

  return { primary, secondary };
}

function normalizeFocus(value: unknown): TrainingFocus {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const primary =
    typeof raw.primary === "string" &&
    (TRAINING_FOCUS_AREAS as readonly string[]).includes(raw.primary)
      ? (raw.primary as TrainingFocusArea)
      : "full_body";

  const secondary =
    raw.secondary === null
      ? null
      : typeof raw.secondary === "string" &&
          (TRAINING_FOCUS_AREAS as readonly string[]).includes(raw.secondary)
        ? (raw.secondary as TrainingFocusArea)
        : null;

  return { primary, secondary };
}

function normalizeConstraints(value: unknown): readonly WorkoutConstraint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const constraints: WorkoutConstraint[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }
    const raw = entry as Record<string, unknown>;
    if (
      typeof raw.kind !== "string" ||
      !(WORKOUT_CONSTRAINT_KINDS as readonly string[]).includes(raw.kind) ||
      typeof raw.code !== "string" ||
      raw.code.trim().length === 0 ||
      typeof raw.severity !== "string" ||
      !(WORKOUT_CONSTRAINT_SEVERITIES as readonly string[]).includes(
        raw.severity,
      )
    ) {
      continue;
    }
    constraints.push({
      kind: raw.kind as WorkoutConstraintKind,
      code: raw.code.trim(),
      severity: raw.severity as WorkoutConstraintSeverity,
    });
  }
  return constraints;
}

function normalizeBlocks(value: unknown): readonly TrainingBlock[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        id: "block-1",
        name: "primary",
        order: 0,
        weekCount: 4,
        priority: { primary: "hypertrophy", secondary: null },
        focus: { primary: "full_body", secondary: null },
      },
    ];
  }

  const blocks: TrainingBlock[] = [];
  value.forEach((entry, index) => {
    if (entry === null || typeof entry !== "object") {
      return;
    }
    const raw = entry as Record<string, unknown>;
    blocks.push({
      id:
        typeof raw.id === "string" && raw.id.trim().length > 0
          ? raw.id.trim()
          : `block-${index + 1}`,
      name:
        typeof raw.name === "string" && raw.name.trim().length > 0
          ? raw.name.trim()
          : `block_${index + 1}`,
      order:
        typeof raw.order === "number" && Number.isInteger(raw.order)
          ? Math.max(0, raw.order)
          : index,
      weekCount:
        typeof raw.weekCount === "number" &&
        Number.isInteger(raw.weekCount) &&
        raw.weekCount >= 1
          ? raw.weekCount
          : 4,
      priority: normalizePriority(raw.priority),
      focus: normalizeFocus(raw.focus),
    });
  });

  return blocks.length > 0
    ? blocks
    : [
        {
          id: "block-1",
          name: "primary",
          order: 0,
          weekCount: 4,
          priority: { primary: "hypertrophy", secondary: null },
          focus: { primary: "full_body", secondary: null },
        },
      ];
}

function normalizeDays(
  value: unknown,
  split: WorkoutSplit,
): readonly WorkoutDayBlueprint[] {
  if (Array.isArray(value) && value.length > 0) {
    const days: WorkoutDayBlueprint[] = [];
    value.forEach((entry, index) => {
      if (entry === null || typeof entry !== "object") {
        return;
      }
      const raw = entry as Record<string, unknown>;
      const isRestDay = raw.isRestDay === true;
      days.push({
        id:
          typeof raw.id === "string" && raw.id.trim().length > 0
            ? raw.id.trim()
            : `day-${index + 1}`,
        dayIndex:
          typeof raw.dayIndex === "number" && Number.isInteger(raw.dayIndex)
            ? Math.max(0, raw.dayIndex)
            : index,
        name:
          typeof raw.name === "string" && raw.name.trim().length > 0
            ? raw.name.trim()
            : isRestDay
              ? "Rest"
              : `Day ${index + 1}`,
        isRestDay,
        focus: normalizeFocus(raw.focus),
        sessionGoal: normalizeSessionGoal(raw.sessionGoal, isRestDay),
        estimatedDurationMinutes:
          raw.estimatedDurationMinutes === null
            ? null
            : typeof raw.estimatedDurationMinutes === "number" &&
                Number.isFinite(raw.estimatedDurationMinutes) &&
                raw.estimatedDurationMinutes > 0
              ? raw.estimatedDurationMinutes
              : isRestDay
                ? null
                : 60,
      });
    });
    if (days.length > 0) {
      return days;
    }
  }

  return defaultDaysForSplit(split);
}

function normalizeSessionGoal(
  value: unknown,
  isRestDay: boolean,
): SessionGoalCode {
  if (
    typeof value === "string" &&
    (SESSION_GOAL_CODES as readonly string[]).includes(value)
  ) {
    return value as SessionGoalCode;
  }
  return isRestDay ? "rest" : "balanced_development";
}

function normalizeMetadata(
  value: unknown,
  options: NormalizeBlueprintOptions,
): WorkoutBlueprintMetadata {
  const raw =
    value !== null && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const source =
    typeof raw.source === "string" &&
    (WORKOUT_BLUEPRINT_SOURCES as readonly string[]).includes(raw.source)
      ? (raw.source as WorkoutBlueprintSource)
      : (options.source ?? "ai");

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter(
        (tag): tag is string =>
          typeof tag === "string" && tag.trim().length > 0,
      )
    : ["workout_blueprint"];

  return {
    version:
      typeof raw.version === "string" && raw.version.trim().length > 0
        ? raw.version.trim()
        : "1.0.0",
    source,
    athleteId:
      raw.athleteId === null
        ? null
        : typeof raw.athleteId === "string"
          ? raw.athleteId
          : (options.athleteId ?? null),
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim().length > 0
        ? raw.createdAt
        : (options.createdAt ?? new Date().toISOString()),
    tags,
  };
}

function defaultDaysPerWeek(type: WorkoutSplitType): number {
  switch (type) {
    case "full_body":
      return 3;
    case "upper_lower":
      return 4;
    case "push_pull_legs":
      return 6;
    case "bro_split":
      return 5;
    case "hybrid":
      return 4;
    case "custom":
      return 3;
  }
}

function defaultDaysForSplit(
  split: WorkoutSplit,
): readonly WorkoutDayBlueprint[] {
  const templates = dayTemplatesForSplit(split.type);
  const trainingCount = Math.min(split.daysPerWeek, templates.length);
  const days: WorkoutDayBlueprint[] = [];

  for (let index = 0; index < split.cycleLengthDays; index += 1) {
    if (index < trainingCount) {
      const template = templates[index]!;
      days.push({
        id: `day-${index + 1}`,
        dayIndex: index,
        name: template.name,
        isRestDay: false,
        focus: template.focus,
        sessionGoal: template.sessionGoal,
        estimatedDurationMinutes: 60,
      });
    } else {
      days.push({
        id: `day-${index + 1}`,
        dayIndex: index,
        name: "Rest",
        isRestDay: true,
        focus: { primary: "full_body", secondary: null },
        sessionGoal: "rest",
        estimatedDurationMinutes: null,
      });
    }
  }

  return days;
}

interface DayTemplate {
  readonly name: string;
  readonly focus: TrainingFocus;
  readonly sessionGoal: SessionGoalCode;
}

function dayTemplatesForSplit(type: WorkoutSplitType): readonly DayTemplate[] {
  switch (type) {
    case "full_body":
      return [
        {
          name: "Full Body A",
          focus: { primary: "full_body", secondary: null },
          sessionGoal: "balanced_development",
        },
        {
          name: "Full Body B",
          focus: { primary: "full_body", secondary: "posterior_chain" },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Full Body C",
          focus: { primary: "full_body", secondary: "core" },
          sessionGoal: "primary_lift_emphasis",
        },
      ];
    case "upper_lower":
      return [
        {
          name: "Upper A",
          focus: { primary: "upper_body", secondary: "push" },
          sessionGoal: "primary_lift_emphasis",
        },
        {
          name: "Lower A",
          focus: { primary: "lower_body", secondary: "posterior_chain" },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Upper B",
          focus: { primary: "upper_body", secondary: "pull" },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Lower B",
          focus: { primary: "lower_body", secondary: "legs" },
          sessionGoal: "primary_lift_emphasis",
        },
      ];
    case "push_pull_legs":
      return [
        {
          name: "Push",
          focus: { primary: "push", secondary: "shoulders" },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Pull",
          focus: { primary: "pull", secondary: "posterior_chain" },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Legs",
          focus: { primary: "legs", secondary: null },
          sessionGoal: "primary_lift_emphasis",
        },
        {
          name: "Push B",
          focus: { primary: "push", secondary: "arms" },
          sessionGoal: "balanced_development",
        },
        {
          name: "Pull B",
          focus: { primary: "pull", secondary: "arms" },
          sessionGoal: "balanced_development",
        },
        {
          name: "Legs B",
          focus: { primary: "legs", secondary: "posterior_chain" },
          sessionGoal: "volume_accumulation",
        },
      ];
    case "bro_split":
      return [
        {
          name: "Chest",
          focus: { primary: "push", secondary: null },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Back",
          focus: { primary: "pull", secondary: null },
          sessionGoal: "volume_accumulation",
        },
        {
          name: "Shoulders",
          focus: { primary: "shoulders", secondary: null },
          sessionGoal: "balanced_development",
        },
        {
          name: "Legs",
          focus: { primary: "legs", secondary: null },
          sessionGoal: "primary_lift_emphasis",
        },
        {
          name: "Arms",
          focus: { primary: "arms", secondary: null },
          sessionGoal: "volume_accumulation",
        },
      ];
    case "hybrid":
    case "custom":
      return [
        {
          name: "Session A",
          focus: { primary: "full_body", secondary: null },
          sessionGoal: "balanced_development",
        },
        {
          name: "Session B",
          focus: { primary: "upper_body", secondary: null },
          sessionGoal: "primary_lift_emphasis",
        },
        {
          name: "Session C",
          focus: { primary: "lower_body", secondary: null },
          sessionGoal: "volume_accumulation",
        },
      ];
  }
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
