import type { WorkoutExercise } from "../../workout-assembly/models/WorkoutExercise";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutModificationChange } from "../models/WorkoutModificationChange";
import {
  WorkoutModificationKinds,
  type WorkoutModificationKind,
} from "../models/WorkoutModificationKind";
import type { WorkoutPlan } from "../models/WorkoutPlan";
import { buildTargetsFromSession } from "../builders/WorkoutPlanBuilder";

const PRESERVED_BASE = Object.freeze([
  "weekly_progression",
  "workout_objectives",
  "recommendation_package",
  "decision_package",
  "exercise_ordering",
] as const);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scaleSets(
  exercise: WorkoutExercise,
  factor: number,
): WorkoutExercise {
  const nextSetCount = Math.max(1, Math.round(exercise.setCount * factor));
  const sets = Object.freeze(
    Array.from({ length: nextSetCount }, (_, index) => {
      const source =
        exercise.sets[Math.min(index, exercise.sets.length - 1)] ??
        Object.freeze({
          setIndex: index + 1,
          repMin: exercise.repMin,
          repMax: exercise.repMax,
          targetRpe: null,
          targetRir: null,
        });
      return Object.freeze({
        ...source,
        setIndex: index + 1,
      });
    }),
  );
  return Object.freeze({
    ...exercise,
    sets,
    setCount: nextSetCount,
    estimatedDurationSeconds: Math.max(
      30,
      Math.round(exercise.estimatedDurationSeconds * factor),
    ),
    estimatedWorkload: Math.round(exercise.estimatedWorkload * factor),
  });
}

function scaleIntensity(
  exercise: WorkoutExercise,
  delta: number,
): WorkoutExercise {
  const sets = Object.freeze(
    exercise.sets.map((set) =>
      Object.freeze({
        ...set,
        targetRpe:
          set.targetRpe === null
            ? null
            : clamp(set.targetRpe + delta, 4, 10),
      }),
    ),
  );
  return Object.freeze({
    ...exercise,
    sets,
    intensityValue:
      exercise.intensityValue === null
        ? null
        : clamp(exercise.intensityValue + delta * 5, 20, 100),
    fatigueEstimate: clamp(exercise.fatigueEstimate + delta * 0.05, 0.05, 1),
  });
}

function reorderExercises(
  exercises: readonly WorkoutExercise[],
): readonly WorkoutExercise[] {
  return Object.freeze(
    exercises.map((exercise, index) =>
      Object.freeze({
        ...exercise,
        order: index + 1,
      }),
    ),
  );
}

function rebuildSession(
  session: WorkoutSession,
  exercises: readonly WorkoutExercise[],
  durationScale = 1,
): WorkoutSession {
  const ordered = reorderExercises(exercises);
  const estimatedDurationSeconds = Math.max(
    60,
    Math.round(
      ordered.reduce((sum, item) => sum + item.estimatedDurationSeconds, 0) *
        durationScale,
    ),
  );
  const estimatedWorkload = ordered.reduce(
    (sum, item) => sum + item.estimatedWorkload,
    0,
  );
  const totalSets = ordered.reduce((sum, item) => sum + item.setCount, 0);
  const totalRepsMin = ordered.reduce(
    (sum, item) => sum + item.repMin * item.setCount,
    0,
  );
  const totalRepsMax = ordered.reduce(
    (sum, item) => sum + item.repMax * item.setCount,
    0,
  );

  return Object.freeze({
    ...session,
    exercises: ordered,
    estimatedDurationSeconds,
    estimatedWorkload,
    summary: Object.freeze({
      ...session.summary,
      exerciseCount: ordered.length,
      totalSets,
      totalRepsMin,
      totalRepsMax,
      estimatedDurationSeconds,
      estimatedWorkload,
    }),
    notes: Object.freeze([...session.notes]),
  });
}

function change(
  id: string,
  kind: WorkoutModificationKind,
  summary: string,
  fieldPath: string,
  previousValue: string,
  nextValue: string,
  preserved: readonly string[] = PRESERVED_BASE,
): WorkoutModificationChange {
  return Object.freeze({
    id,
    kind,
    summary,
    fieldPath,
    previousValue,
    nextValue,
    preserved: Object.freeze([...preserved]),
  });
}

function findExerciseIndex(
  exercises: readonly WorkoutExercise[],
  message: string,
): number {
  const lower = message.toLowerCase();
  const byName = exercises.findIndex((exercise) =>
    lower.includes(exercise.name.toLowerCase()),
  );
  if (byName >= 0) return byName;
  return exercises.length > 0 ? 0 : -1;
}

function extractFocus(message: string): string {
  const match = message.match(
    /\b(chest|back|legs?|shoulders?|arms?|glutes?|core|push|pull|upper|lower)\b/i,
  );
  return match?.[1]?.toLowerCase() ?? "priority muscle group";
}

function extractEquipment(message: string): string {
  const match = message.match(
    /\b(barbell|dumbbell|cable|machine|bench|equipment)\b/i,
  );
  return match?.[1]?.toLowerCase() ?? "equipment";
}

function extractInjuryRegion(message: string): string {
  const match = message.match(
    /\b(shoulder|knee|back|wrist|elbow|hip|ankle)\b/i,
  );
  return match?.[1]?.toLowerCase() ?? "affected area";
}

export interface ApplyWorkoutModificationOutput {
  readonly plan: WorkoutPlan;
  readonly changes: readonly WorkoutModificationChange[];
  readonly preserved: readonly string[];
  readonly explanation: string;
  readonly progressionImpact: string;
  readonly recoveryImpact: string;
}

/**
 * Apply a surgical modification to an existing WorkoutPlan.
 * Does not regenerate the plan — only affected portions change.
 */
export function applyWorkoutModification(input: {
  readonly plan: WorkoutPlan;
  readonly kind: WorkoutModificationKind;
  readonly message: string;
  readonly at: string;
  readonly requestId: string;
}): ApplyWorkoutModificationOutput | null {
  const { plan, kind, message, at, requestId } = input;

  if (kind === WorkoutModificationKinds.UNKNOWN) {
    return null;
  }

  const session = plan.primarySession;
  const exercises = [...session.exercises];
  const changes: WorkoutModificationChange[] = [];
  let nextExercises = exercises;
  let durationScale = 1;
  let volumeFactor = 1;
  let nextObjectives = plan.objectives;
  let nextConstraints = plan.constraints;
  let nextProgression = plan.progression;
  let nextProposal = plan.proposal;
  let nextMetrics = plan.metrics;
  let recoveryImpact = "Recovery posture unchanged.";
  let progressionImpact =
    "Weekly progression cue and week number preserved.";
  let explanation = "";

  switch (kind) {
    case WorkoutModificationKinds.REPLACE_EXERCISE: {
      const index = findExerciseIndex(exercises, message);
      if (index < 0) return null;
      const original = exercises[index]!;
      const replacementName = `${original.name} (adapted)`;
      const replaced = Object.freeze({
        ...original,
        id: `${original.id}:adapted`,
        exerciseId: `${original.exerciseId}:adapted`,
        name: replacementName,
        notes: Object.freeze([
          ...original.notes,
          `Replaced based on coaching request: ${message.slice(0, 80)}`,
        ]),
      });
      nextExercises = exercises.map((item, i) =>
        i === index ? replaced : item,
      );
      changes.push(
        change(
          `${requestId}:replace`,
          kind,
          `Replaced "${original.name}" with "${replacementName}"`,
          `primarySession.exercises[${index}]`,
          original.name,
          replacementName,
        ),
      );
      explanation = `Replaced ${original.name} while keeping session order and remaining exercises.`;
      break;
    }
    case WorkoutModificationKinds.REMOVE_EXERCISE: {
      if (exercises.length <= 1) return null;
      const index = findExerciseIndex(exercises, message);
      const targetIndex = index === 0 && exercises.length > 1 ? exercises.length - 1 : index;
      const removed = exercises[targetIndex]!;
      nextExercises = exercises.filter((_, i) => i !== targetIndex);
      changes.push(
        change(
          `${requestId}:remove`,
          kind,
          `Removed "${removed.name}"`,
          `primarySession.exercises[${targetIndex}]`,
          removed.name,
          "(removed)",
        ),
      );
      explanation = `Removed ${removed.name}. Remaining exercise order was preserved.`;
      break;
    }
    case WorkoutModificationKinds.ADD_EXERCISE: {
      const template = exercises[exercises.length - 1] ?? exercises[0];
      if (!template) return null;
      const added = Object.freeze({
        ...scaleSets(template, 0.75),
        id: `${template.id}:added:${requestId}`,
        exerciseId: `${template.exerciseId}:accessory`,
        name: `${template.name} Accessory`,
        role: template.role,
        order: exercises.length + 1,
        notes: Object.freeze([
          ...template.notes,
          "Added via adaptive coaching modification",
        ]),
      });
      nextExercises = [...exercises, added];
      changes.push(
        change(
          `${requestId}:add`,
          kind,
          `Added "${added.name}"`,
          "primarySession.exercises",
          String(exercises.length),
          String(nextExercises.length),
        ),
      );
      explanation = `Added ${added.name} at the end of the session without reshuffling existing work.`;
      break;
    }
    case WorkoutModificationKinds.REDUCE_DURATION: {
      durationScale = 0.8;
      nextExercises = exercises.map((item) => scaleSets(item, 0.85));
      changes.push(
        change(
          `${requestId}:duration-down`,
          kind,
          "Reduced session duration ~20%",
          "metrics.estimatedDurationSeconds",
          String(plan.metrics.estimatedDurationSeconds),
          String(Math.round(plan.metrics.estimatedDurationSeconds * 0.8)),
        ),
      );
      explanation =
        "Shortened the session by trimming set volume while preserving exercise order.";
      recoveryImpact = "Shorter session should reduce acute recovery demand.";
      break;
    }
    case WorkoutModificationKinds.INCREASE_DURATION: {
      durationScale = 1.15;
      nextExercises = exercises.map((item) => scaleSets(item, 1.1));
      changes.push(
        change(
          `${requestId}:duration-up`,
          kind,
          "Increased session duration ~15%",
          "metrics.estimatedDurationSeconds",
          String(plan.metrics.estimatedDurationSeconds),
          String(Math.round(plan.metrics.estimatedDurationSeconds * 1.15)),
        ),
      );
      explanation =
        "Extended the session with modest volume increases; exercise order unchanged.";
      recoveryImpact = "Longer session may increase recovery demand slightly.";
      break;
    }
    case WorkoutModificationKinds.REDUCE_INTENSITY: {
      nextExercises = exercises.map((item) => scaleIntensity(item, -1));
      nextProposal = Object.freeze({
        ...plan.proposal,
        intensityScore: clamp(plan.proposal.intensityScore - 10, 10, 100),
      });
      changes.push(
        change(
          `${requestId}:intensity-down`,
          kind,
          "Reduced intensity / RPE targets",
          "metrics.intensityScore",
          String(plan.metrics.intensityScore),
          String(clamp(plan.metrics.intensityScore - 10, 10, 100)),
        ),
      );
      explanation =
        "Lowered intensity targets across exercises; volume structure preserved.";
      recoveryImpact = "Lower intensity should ease recovery stress.";
      progressionImpact =
        "Progression week preserved; intensity cue softened for this session.";
      break;
    }
    case WorkoutModificationKinds.INCREASE_INTENSITY: {
      nextExercises = exercises.map((item) => scaleIntensity(item, 1));
      nextProposal = Object.freeze({
        ...plan.proposal,
        intensityScore: clamp(plan.proposal.intensityScore + 8, 10, 100),
      });
      changes.push(
        change(
          `${requestId}:intensity-up`,
          kind,
          "Increased intensity / RPE targets",
          "metrics.intensityScore",
          String(plan.metrics.intensityScore),
          String(clamp(plan.metrics.intensityScore + 8, 10, 100)),
        ),
      );
      explanation =
        "Raised intensity targets across exercises; exercise selection unchanged.";
      recoveryImpact = "Higher intensity may increase recovery demand.";
      progressionImpact =
        "Progression week preserved; overload applied within current week.";
      break;
    }
    case WorkoutModificationKinds.MODIFY_VOLUME: {
      const reduce = /\b(reduce|fewer|less|lower|cut)\b/i.test(message);
      volumeFactor = reduce ? 0.8 : 1.2;
      nextExercises = exercises.map((item) => scaleSets(item, volumeFactor));
      nextProposal = Object.freeze({
        ...plan.proposal,
        volumeScore: clamp(
          Math.round(plan.proposal.volumeScore * volumeFactor),
          10,
          100,
        ),
      });
      changes.push(
        change(
          `${requestId}:volume`,
          kind,
          reduce ? "Reduced training volume" : "Increased training volume",
          "metrics.volumeScore",
          String(plan.metrics.volumeScore),
          String(
            clamp(Math.round(plan.metrics.volumeScore * volumeFactor), 10, 100),
          ),
        ),
      );
      explanation = reduce
        ? "Reduced set volume while keeping the same exercise lineup."
        : "Increased set volume while keeping the same exercise lineup.";
      recoveryImpact = reduce
        ? "Lower volume should improve recovery margin."
        : "Higher volume may increase recovery demand.";
      break;
    }
    case WorkoutModificationKinds.EQUIPMENT_UNAVAILABLE: {
      const equipment = extractEquipment(message);
      const index = findExerciseIndex(exercises, message);
      if (index >= 0) {
        const original = exercises[index]!;
        const replacement = Object.freeze({
          ...original,
          id: `${original.id}:no-${equipment}`,
          exerciseId: `${original.exerciseId}:alt`,
          name: `${original.name} (no ${equipment})`,
          notes: Object.freeze([
            ...original.notes,
            `Adapted for unavailable ${equipment}`,
          ]),
        });
        nextExercises = exercises.map((item, i) =>
          i === index ? replacement : item,
        );
        changes.push(
          change(
            `${requestId}:equipment`,
            kind,
            `Adapted "${original.name}" for unavailable ${equipment}`,
            `primarySession.exercises[${index}]`,
            original.name,
            replacement.name,
          ),
        );
      }
      nextConstraints = Object.freeze({
        ...plan.constraints,
        equipment: Object.freeze(
          plan.constraints.equipment.filter((item) => item !== equipment),
        ),
        athleteConstraints: Object.freeze([
          ...plan.constraints.athleteConstraints,
          `equipment_unavailable:${equipment}`,
        ]),
      });
      explanation = `Adapted the plan for unavailable ${equipment} without regenerating the full program.`;
      break;
    }
    case WorkoutModificationKinds.INJURY_LIMITATION: {
      const region = extractInjuryRegion(message);
      nextExercises = exercises.map((item) =>
        scaleIntensity(scaleSets(item, 0.85), -1),
      );
      nextConstraints = Object.freeze({
        ...plan.constraints,
        athleteConstraints: Object.freeze([
          ...plan.constraints.athleteConstraints,
          `injury_limitation:${region}`,
        ]),
        recoveryConstraints: Object.freeze([
          ...plan.constraints.recoveryConstraints,
          `protect:${region}`,
        ]),
      });
      nextProposal = Object.freeze({
        ...plan.proposal,
        intensityScore: clamp(plan.proposal.intensityScore - 12, 10, 100),
        volumeScore: clamp(Math.round(plan.proposal.volumeScore * 0.85), 10, 100),
      });
      changes.push(
        change(
          `${requestId}:injury`,
          kind,
          `Applied injury limitation for ${region}`,
          "constraints.athleteConstraints",
          plan.constraints.athleteConstraints.join(", ") || "(none)",
          `injury_limitation:${region}`,
        ),
      );
      explanation = `Reduced volume/intensity and recorded an injury limitation for ${region}.`;
      recoveryImpact = `Protecting ${region}; recovery priority elevated.`;
      progressionImpact =
        "Progression week preserved; load progression paused for the limited region.";
      break;
    }
    case WorkoutModificationKinds.FATIGUE_ADJUSTMENT: {
      nextExercises = exercises.map((item) =>
        scaleIntensity(scaleSets(item, 0.75), -1),
      );
      nextProposal = Object.freeze({
        ...plan.proposal,
        intensityScore: clamp(plan.proposal.intensityScore - 15, 10, 100),
        volumeScore: clamp(Math.round(plan.proposal.volumeScore * 0.75), 10, 100),
      });
      nextConstraints = Object.freeze({
        ...plan.constraints,
        recoveryConstraints: Object.freeze([
          ...plan.constraints.recoveryConstraints,
          "fatigue_adjustment",
        ]),
      });
      changes.push(
        change(
          `${requestId}:fatigue`,
          kind,
          "Applied fatigue adjustment (lower volume + intensity)",
          "metrics.volumeScore",
          String(plan.metrics.volumeScore),
          String(clamp(Math.round(plan.metrics.volumeScore * 0.75), 10, 100)),
        ),
      );
      explanation =
        "Dialed volume and intensity down for fatigue while keeping the same exercise structure.";
      recoveryImpact = "Fatigue adjustment prioritizes recovery capacity.";
      progressionImpact =
        "Progression week preserved; overload deferred until readiness improves.";
      break;
    }
    case WorkoutModificationKinds.RECOVERY_ADJUSTMENT: {
      nextExercises = exercises.map((item) =>
        scaleIntensity(scaleSets(item, 0.7), -1.5),
      );
      nextProgression = Object.freeze({
        ...plan.progression,
        deloadRecommended: true,
        cue: plan.progression.cue
          ? `${plan.progression.cue} (recovery-adjusted)`
          : "Recovery-focused session",
        notes: Object.freeze([
          ...plan.progression.notes,
          "Adaptive recovery adjustment applied",
        ]),
      });
      nextConstraints = Object.freeze({
        ...plan.constraints,
        recoveryConstraints: Object.freeze([
          ...new Set([
            ...plan.constraints.recoveryConstraints,
            "deload_recommended",
            "recovery_adjustment",
          ]),
        ]),
      });
      nextProposal = Object.freeze({
        ...plan.proposal,
        deloadRecommended: true,
        intensityScore: clamp(plan.proposal.intensityScore - 20, 10, 100),
        volumeScore: clamp(Math.round(plan.proposal.volumeScore * 0.7), 10, 100),
      });
      changes.push(
        change(
          `${requestId}:recovery`,
          kind,
          "Applied recovery / deload adjustment",
          "progression.deloadRecommended",
          String(plan.progression.deloadRecommended),
          "true",
        ),
      );
      explanation =
        "Shifted the session toward recovery with lower volume/intensity; week number unchanged.";
      recoveryImpact = "Recovery adjustment elevates deload posture.";
      progressionImpact =
        "Progression week preserved with deload recommended for this cycle.";
      break;
    }
    case WorkoutModificationKinds.FOCUS_MUSCLE_GROUP: {
      const focus = extractFocus(message);
      nextObjectives = Object.freeze({
        ...plan.objectives,
        focusAreas: Object.freeze(
          Array.from(new Set([focus, ...plan.objectives.focusAreas])),
        ),
        secondary: Object.freeze(
          Array.from(
            new Set([`focus:${focus}`, ...plan.objectives.secondary]),
          ),
        ),
      });
      changes.push(
        change(
          `${requestId}:focus`,
          kind,
          `Focused plan on ${focus}`,
          "objectives.focusAreas",
          plan.objectives.focusAreas.join(", ") || "(none)",
          focus,
          Object.freeze([
            ...PRESERVED_BASE.filter((item) => item !== "workout_objectives"),
            "primary_objective",
          ]),
        ),
      );
      explanation = `Emphasized ${focus} in plan objectives without regenerating sessions.`;
      break;
    }
    default:
      return null;
  }

  const nextSession = rebuildSession(session, nextExercises, durationScale);
  const targets = buildTargetsFromSession(nextSession);

  const scaleMetric = (value: number, factor: number, floor = 0.05) =>
    Math.max(floor, Number((value * factor).toFixed(4)));

  let intensityScore = plan.metrics.intensityScore;
  let volumeScore = plan.metrics.volumeScore;

  switch (kind) {
    case WorkoutModificationKinds.REDUCE_INTENSITY:
      intensityScore = scaleMetric(plan.metrics.intensityScore, 0.85);
      break;
    case WorkoutModificationKinds.INCREASE_INTENSITY:
      intensityScore = scaleMetric(plan.metrics.intensityScore, 1.1);
      break;
    case WorkoutModificationKinds.MODIFY_VOLUME:
      volumeScore = scaleMetric(plan.metrics.volumeScore, volumeFactor);
      break;
    case WorkoutModificationKinds.REDUCE_DURATION:
      volumeScore = scaleMetric(plan.metrics.volumeScore, 0.85);
      break;
    case WorkoutModificationKinds.INCREASE_DURATION:
      volumeScore = scaleMetric(plan.metrics.volumeScore, 1.1);
      break;
    case WorkoutModificationKinds.INJURY_LIMITATION:
      intensityScore = scaleMetric(plan.metrics.intensityScore, 0.85);
      volumeScore = scaleMetric(plan.metrics.volumeScore, 0.85);
      break;
    case WorkoutModificationKinds.FATIGUE_ADJUSTMENT:
      intensityScore = scaleMetric(plan.metrics.intensityScore, 0.8);
      volumeScore = scaleMetric(plan.metrics.volumeScore, 0.75);
      break;
    case WorkoutModificationKinds.RECOVERY_ADJUSTMENT:
      intensityScore = scaleMetric(plan.metrics.intensityScore, 0.7);
      volumeScore = scaleMetric(plan.metrics.volumeScore, 0.7);
      break;
    default:
      break;
  }

  nextMetrics = Object.freeze({
    estimatedDurationSeconds: nextSession.estimatedDurationSeconds,
    estimatedWorkload: nextSession.estimatedWorkload,
    exerciseCount: nextSession.exercises.length,
    setCount: nextSession.summary.totalSets,
    volumeScore,
    intensityScore,
    readinessScore: plan.metrics.readinessScore,
  });

  const week = plan.weeks[0];
  const nextWeeks =
    week === undefined
      ? plan.weeks
      : Object.freeze([
          Object.freeze({
            ...week,
            days: Object.freeze(
              week.days.map((day, index) =>
                index === 0
                  ? Object.freeze({
                      ...day,
                      estimatedDurationSeconds:
                        nextSession.estimatedDurationSeconds,
                      session: nextSession,
                    })
                  : day,
              ),
            ),
          }),
        ]);

  const modificationNote = `Adaptive modification (${kind}): ${explanation}`;
  const nextPlan: WorkoutPlan = Object.freeze({
    ...plan,
    id: `${plan.id}:mod:${requestId}`,
    name: plan.name,
    proposal: nextProposal,
    primarySession: nextSession,
    weeks: nextWeeks,
    objectives: nextObjectives,
    constraints: nextConstraints,
    progression: nextProgression,
    targets,
    notes: Object.freeze({
      coachNotes: Object.freeze([...plan.notes.coachNotes, modificationNote]),
      recoveryNotes: Object.freeze([
        ...plan.notes.recoveryNotes,
        ...(kind === WorkoutModificationKinds.RECOVERY_ADJUSTMENT ||
        kind === WorkoutModificationKinds.FATIGUE_ADJUSTMENT ||
        kind === WorkoutModificationKinds.INJURY_LIMITATION
          ? [modificationNote]
          : []),
      ]),
      sessionNotes: Object.freeze([
        ...plan.notes.sessionNotes,
        modificationNote,
      ]),
      rationale: Object.freeze([...plan.notes.rationale, modificationNote]),
    }),
    metrics: nextMetrics,
    statistics: Object.freeze({
      ...plan.statistics,
      exerciseCount: nextSession.exercises.length,
      targetCount: targets.length,
    }),
    summary: Object.freeze({
      ...plan.summary,
      estimatedDurationMinutes: Math.round(
        nextSession.estimatedDurationSeconds / 60,
      ),
      exerciseCount: nextSession.exercises.length,
      message: `Updated ${nextSession.exercises.length}-exercise workout (${plan.summary.title}) via adaptive modification.`,
    }),
    metadata: Object.freeze({
      ...plan.metadata,
      tags: Object.freeze([
        ...plan.metadata.tags,
        "adaptive_modification",
        kind,
      ]),
      attributes: Object.freeze({
        ...plan.metadata.attributes,
        lastModificationKind: kind,
        lastModificationRequestId: requestId,
        sourcePlanId: plan.id,
      }),
    }),
    // Preserve packages / generation / context — living object continuity
    unifiedContext: plan.unifiedContext,
    decisionPackage: plan.decisionPackage,
    recommendationPackage: plan.recommendationPackage,
    generation: plan.generation,
    createdAt: plan.createdAt,
    frozenAt: at,
  });

  return Object.freeze({
    plan: nextPlan,
    changes: Object.freeze(changes),
    preserved: PRESERVED_BASE,
    explanation,
    progressionImpact,
    recoveryImpact,
  });
}
