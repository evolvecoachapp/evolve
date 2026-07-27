import {
  CoachConversationIntents,
  type CoachConversationIntent,
} from "../models/CoachConversationIntent";
import type { CoachConversationContext } from "../models/CoachConversationContext";
import type { CoachConversationResponse } from "../models/CoachConversationResponse";

function planIntro(context: CoachConversationContext): string {
  const plan = context.workoutPlan;
  if (!plan) {
    return "No active WorkoutPlan is attached to this coaching session yet. Generate a workout first, then ask follow-up questions.";
  }
  return `Active plan "${plan.summary.title}" (${plan.summary.focus}, ${plan.summary.daysPerWeek} days/week, ~${plan.summary.estimatedDurationMinutes} min, ${plan.summary.exerciseCount} exercises).`;
}

function exerciseLines(context: CoachConversationContext): string {
  const plan = context.workoutPlan;
  if (!plan) return "";
  const names = plan.primarySession.exercises
    .slice(0, 6)
    .map((exercise) => exercise.name);
  if (names.length === 0) return "No exercises are listed on the primary session yet.";
  return `Primary session exercises: ${names.join(", ")}${plan.primarySession.exercises.length > 6 ? ", …" : ""}.`;
}

function progressionLines(context: CoachConversationContext): string {
  const plan = context.workoutPlan;
  if (!plan) return "";
  const cue = plan.progression.cue ?? "Follow the plan progression cues.";
  const deload = plan.progression.deloadRecommended
    ? " A deload is currently recommended."
    : "";
  const notes =
    plan.progression.notes.length > 0
      ? ` Notes: ${plan.progression.notes.slice(0, 3).join("; ")}.`
      : "";
  return `Progression (week ${plan.progression.weekNumber}): ${cue}.${deload}${notes}`;
}

function recoveryLines(context: CoachConversationContext): string {
  if (!context.workoutPlan) return "";
  if (context.recoveryNotes.length === 0) {
    return "Recovery guidance is embedded in the current plan constraints and readiness context.";
  }
  return `Recovery decisions: ${context.recoveryNotes.slice(0, 4).join("; ")}.`;
}

function recommendationLines(context: CoachConversationContext): string {
  if (!context.workoutPlan) return "";
  if (context.recommendationTitles.length === 0) {
    return "No structured recommendations are attached to the current plan.";
  }
  return `Current recommendations: ${context.recommendationTitles.slice(0, 5).join("; ")}.`;
}

function memoryLines(context: CoachConversationContext): string {
  if (context.memoryHints.length === 0) return "";
  return ` From prior coaching memory: ${context.memoryHints.slice(0, 3).join("; ")}.`;
}

function sessionHint(context: CoachConversationContext): string {
  if (!context.session?.response?.message) return "";
  return ` Session note: ${context.session.response.message}`;
}

function modificationLines(context: CoachConversationContext): string {
  const modification = context.modification;
  const plan = context.workoutPlan;
  if (!modification) {
    return "No adaptive modification was applied on this turn.";
  }

  const changed = modification.changes
    .map((item) => item.summary)
    .slice(0, 4)
    .join("; ");
  const preserved = modification.preserved.slice(0, 5).join(", ");
  const planRef = plan
    ? ` Updated plan "${plan.summary.title}" now has ${plan.summary.exerciseCount} exercises (~${plan.summary.estimatedDurationMinutes} min).`
    : "";

  if (!modification.success || !plan) {
    return `${modification.explanation} The active WorkoutPlan was left unchanged.`;
  }

  return [
    modification.explanation,
    changed ? `What changed: ${changed}.` : "",
    preserved ? `What remained unchanged: ${preserved}.` : "",
    `Progression impact: ${modification.progressionImpact}`,
    `Recovery impact: ${modification.recoveryImpact}`,
    planRef,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function restoreLines(context: CoachConversationContext): string {
  const restore = context.restore;
  if (!restore) {
    return "No plan restore was applied on this turn.";
  }

  if (!restore.success) {
    return `I could not restore that plan version: ${restore.message} History was left unchanged.`;
  }

  const version = restore.publishedVersion
    ? `Published as new version ${restore.publishedVersion.versionNumber}.`
    : "";
  return [
    restore.restoredSummary,
    restore.revertedSummary,
    `Why: ${restore.restoreReason}.`,
    `Progression impact: ${restore.progressionImpact}`,
    version,
    "Prior history remains immutable — nothing was deleted or overwritten.",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildMessage(
  intent: CoachConversationIntent,
  context: CoachConversationContext,
): { readonly message: string; readonly topics: readonly string[] } {
  const intro = planIntro(context);
  const memory = memoryLines(context);
  const session = sessionHint(context);

  switch (intent) {
    case CoachConversationIntents.WORKOUT_MODIFICATION:
      return {
        message: `${intro} ${modificationLines(context)}${memory}${session}`.trim(),
        topics: Object.freeze([
          "workout_modification",
          "workout_plan",
          context.modification?.kind ?? "unknown",
        ]),
      };
    case CoachConversationIntents.PLAN_RESTORE:
      return {
        message: `${intro} ${restoreLines(context)}${memory}${session}`.trim(),
        topics: Object.freeze([
          "plan_restore",
          context.restore?.request.target.planType ?? "workout",
        ]),
      };
    case CoachConversationIntents.WORKOUT_SUMMARY: {
      const plan = context.workoutPlan;
      const summary = plan
        ? `${plan.summary.message} Objectives: ${plan.objectives.primary}.`
        : intro;
      return {
        message: `${intro} ${summary}${memory}${session}`.trim(),
        topics: Object.freeze(["workout_summary", "workout_plan"]),
      };
    }
    case CoachConversationIntents.EXERCISE_EXPLANATION: {
      const rationale =
        context.workoutPlan?.notes.rationale.slice(0, 3).join("; ") ?? "";
      return {
        message:
          `${intro} ${exerciseLines(context)} ${rationale ? `Rationale: ${rationale}.` : "Exercise choices follow the plan objectives and constraints."}${memory}${session}`.trim(),
        topics: Object.freeze(["exercise_explanation", "workout_plan"]),
      };
    }
    case CoachConversationIntents.PROGRESSION_EXPLANATION:
      return {
        message: `${intro} ${progressionLines(context)}${memory}${session}`.trim(),
        topics: Object.freeze(["progression_explanation", "workout_plan"]),
      };
    case CoachConversationIntents.RECOVERY_EXPLANATION:
      return {
        message: `${intro} ${recoveryLines(context)}${memory}${session}`.trim(),
        topics: Object.freeze(["recovery_explanation", "workout_plan"]),
      };
    case CoachConversationIntents.RECOMMENDATION_EXPLANATION:
      return {
        message: `${intro} ${recommendationLines(context)}${memory}${session}`.trim(),
        topics: Object.freeze(["recommendation_explanation", "workout_plan"]),
      };
    case CoachConversationIntents.WORKOUT_EXPLANATION: {
      const plan = context.workoutPlan;
      const objectives = plan
        ? `Primary objective: ${plan.objectives.primary}. Focus areas: ${plan.objectives.focusAreas.slice(0, 4).join(", ") || "general training"}.`
        : "";
      return {
        message:
          `${intro} ${objectives} ${exerciseLines(context)} ${progressionLines(context)} ${recommendationLines(context)}${memory}${session}`.trim(),
        topics: Object.freeze(["workout_explanation", "workout_plan"]),
      };
    }
    case CoachConversationIntents.GENERAL_COACHING:
      return {
        message:
          `${intro} I can explain today's workout, modify or restore the active plan, or cover exercises, progression, recovery, and recommendations using your coaching session.${memory}${session}`.trim(),
        topics: Object.freeze(["general_coaching"]),
      };
    case CoachConversationIntents.UNKNOWN:
    default:
      return {
        message:
          `${intro} I did not match a specific coaching intent. Ask about today's workout, request a modification, undo/restore a prior version, or ask about progression, recovery, or recommendations.${memory}${session}`.trim(),
        topics: Object.freeze(["unknown"]),
      };
  }
}

export function buildCoachConversationResponse(
  context: CoachConversationContext,
  responseId: string,
  createdAt: string,
): CoachConversationResponse {
  const built = buildMessage(context.intent, context);
  return Object.freeze({
    id: responseId,
    intent: context.intent,
    message: built.message,
    referencesWorkoutPlan: context.workoutPlan !== null,
    planId: context.workoutPlan?.id ?? null,
    topics: built.topics,
    createdAt,
  });
}
