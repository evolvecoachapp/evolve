import { CoachResponseBuilder } from "../../response-formatter/builders/CoachResponseBuilder";
import { createCoachMessage } from "../../response-formatter/models/CoachMessage";
import {
  DEFAULT_COACH_CONFIDENCE,
} from "../../response-formatter/models/CoachConfidence";
import {
  DEFAULT_COACH_FORMATTING,
} from "../../response-formatter/models/CoachFormatting";
import { EMPTY_COACH_METADATA } from "../../response-formatter/models/CoachMetadata";
import {
  CoachRecommendationCategories,
  CoachSeverities,
} from "../../response-formatter/models/CoachRecommendation";
import { CoachResponseIntents } from "../../response-formatter/models/CoachResponseIntent";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import { CoachActionKinds } from "../../response-formatter/models/CoachAction";
import { CoachInsightKinds } from "../../response-formatter/models/CoachInsight";
import {
  createActionEngineService,
  type ActionEngineService,
} from "../services/ActionEngineService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

/**
 * Mock CoachResponse with workout / nutrition / recovery / goals / questions.
 */
export function createRichCoachResponseFixture(
  overrides: { readonly id?: string } = {},
): CoachResponse {
  return new CoachResponseBuilder()
    .withId(overrides.id ?? "coach:rich:1")
    .withSourceResponseId("ai:response:1")
    .withMessage(
      createCoachMessage(
        "message:1",
        "Focus on controlled tempo and recovery nutrition.",
      ),
    )
    .withIntent(CoachResponseIntents.MIXED)
    .withRecommendations(
      Object.freeze([
        Object.freeze({
          id: "rec:1",
          text: "Increase weekly volume gradually",
          category: CoachRecommendationCategories.TRAINING,
          priority: 1,
          severity: CoachSeverities.MEDIUM,
        }),
      ]),
    )
    .withWarnings(Object.freeze([]))
    .withInsights(
      Object.freeze([
        Object.freeze({
          id: "insight:1",
          text: "Volume trend is upward",
          kind: CoachInsightKinds.PATTERN,
        }),
      ]),
    )
    .withActions(
      Object.freeze([
        Object.freeze({
          id: "action:1",
          label: "Start lower-body session",
          description: "Begin planned workout",
          kind: CoachActionKinds.START_WORKOUT,
          payload: Object.freeze({ session: "lower" }),
        }),
      ]),
    )
    .withExercises(
      Object.freeze([
        Object.freeze({
          id: "ex:1",
          name: "Back Squat",
          sets: 3,
          reps: "5",
          notes: "Controlled tempo",
        }),
      ]),
    )
    .withNutrition(
      Object.freeze([
        Object.freeze({
          id: "nut:1",
          text: "Add 30g protein post-workout",
          timing: "post",
        }),
      ]),
    )
    .withRecovery(
      Object.freeze([
        Object.freeze({
          id: "recov:1",
          text: "Sleep 8 hours tonight",
          focus: "sleep",
        }),
      ]),
    )
    .withQuestions(
      Object.freeze([
        Object.freeze({
          id: "q:1",
          text: "How sore are your quads?",
          optional: false,
        }),
      ]),
    )
    .withCitations(Object.freeze([]))
    .withSections(Object.freeze([]))
    .withConfidence(DEFAULT_COACH_CONFIDENCE)
    .withFormatting(DEFAULT_COACH_FORMATTING)
    .withMetadata({
      ...EMPTY_COACH_METADATA,
      providerId: "openai",
      sourceResponseId: "ai:response:1",
    })
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

/**
 * Minimal CoachResponse with message only (no actionable content).
 */
export function createEmptyCoachResponseFixture(): CoachResponse {
  return new CoachResponseBuilder()
    .withId("coach:empty:1")
    .withSourceResponseId("ai:response:empty")
    .withMessage(createCoachMessage("message:empty", "Rest day acknowledgment."))
    .withIntent(CoachResponseIntents.INFORMATIONAL)
    .withConfidence(DEFAULT_COACH_CONFIDENCE)
    .withFormatting(DEFAULT_COACH_FORMATTING)
    .withMetadata(EMPTY_COACH_METADATA)
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

/**
 * Workout-focused CoachResponse.
 */
export function createWorkoutCoachResponseFixture(): CoachResponse {
  return new CoachResponseBuilder()
    .withId("coach:workout:1")
    .withSourceResponseId("ai:response:workout")
    .withMessage(createCoachMessage("message:w", "Here is your workout."))
    .withIntent(CoachResponseIntents.ACTIONABLE)
    .withExercises(
      Object.freeze([
        Object.freeze({
          id: "ex:bench",
          name: "Bench Press",
          sets: 4,
          reps: "6",
          notes: null,
        }),
      ]),
    )
    .withConfidence(DEFAULT_COACH_CONFIDENCE)
    .withFormatting(DEFAULT_COACH_FORMATTING)
    .withMetadata(EMPTY_COACH_METADATA)
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

export function createTestEngineHarness(): {
  readonly service: ActionEngineService;
} {
  return Object.freeze({
    service: createActionEngineService(),
  });
}
