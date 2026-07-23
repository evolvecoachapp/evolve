import { createAthleteProfile } from "../../athlete-context/testSupport/fixtures";
import type { ConversationContext } from "../../ai/models/ConversationContext";
import { buildPromptContext } from "../../prompt-builder/utils/buildPromptContext";
import {
  createCoachSummary,
  createSnapshot,
} from "../../prompt-builder/testSupport/fixtures";
import type { PromptContext } from "../../prompt-builder/models/coach/PromptContext";
import type { WorkoutSummary } from "../../workout/models/WorkoutSummary";
import type { MemoryContext } from "../models/MemoryContext";
import type { PromptRequest } from "../models/PromptRequest";

export const FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export function createMemoryContext(
  overrides: Partial<MemoryContext> = {},
): MemoryContext {
  return Object.freeze({
    entries: Object.freeze(
      overrides.entries ??
        Object.freeze([
          Object.freeze({
            id: "mem-1",
            category: "preference",
            summary: "Prefers morning sessions",
            importance: 0.7,
            capturedAt: FIXED_TIMESTAMP,
          }),
        ]),
    ),
    capturedAt: overrides.capturedAt ?? FIXED_TIMESTAMP,
  });
}

export function createWorkoutSummaryFixture(
  overrides: Partial<WorkoutSummary> = {},
): WorkoutSummary {
  return {
    sessionId: overrides.sessionId ?? "session-1",
    workoutId: overrides.workoutId ?? "workout-1",
    title: overrides.title ?? "Upper Strength",
    durationMinutes: overrides.durationMinutes ?? 55,
    totalVolumeKg: overrides.totalVolumeKg ?? 4200,
    completedSets: overrides.completedSets ?? 16,
    totalSets: overrides.totalSets ?? 18,
    completedExercises: overrides.completedExercises ?? 5,
    totalExercises: overrides.totalExercises ?? 5,
    skippedExercises: overrides.skippedExercises ?? 0,
    completedAt: overrides.completedAt ?? FIXED_TIMESTAMP,
    notes: overrides.notes ?? null,
  };
}

export function createConversationContext(
  overrides: Partial<ConversationContext> = {},
): ConversationContext {
  return Object.freeze({
    conversationId: overrides.conversationId ?? "conv-1",
    messages: Object.freeze(
      overrides.messages ??
        Object.freeze([
          Object.freeze({
            id: "msg-1",
            role: "user" as const,
            content: "What should I train?",
            createdAt: FIXED_TIMESTAMP,
          }),
        ]),
    ),
  });
}

export function createBasePromptContext(
  overrides: { readonly generatedAt?: string } = {},
): PromptContext {
  return buildPromptContext(createSnapshot(), {
    generatedAt: overrides.generatedAt ?? FIXED_TIMESTAMP,
    profile: createAthleteProfile(),
  });
}

export function createPromptRequest(
  overrides: Partial<PromptRequest> = {},
): PromptRequest {
  return Object.freeze({
    message: overrides.message ?? "How should I structure my workout today?",
    conversation:
      overrides.conversation !== undefined
        ? overrides.conversation
        : createConversationContext(),
    athleteProfile:
      overrides.athleteProfile !== undefined
        ? overrides.athleteProfile
        : createAthleteProfile(),
    memory:
      overrides.memory !== undefined ? overrides.memory : createMemoryContext(),
    workoutSummary:
      overrides.workoutSummary !== undefined
        ? overrides.workoutSummary
        : createWorkoutSummaryFixture(),
    coachSummary:
      overrides.coachSummary !== undefined
        ? overrides.coachSummary
        : createCoachSummary(),
    promptContext:
      overrides.promptContext !== undefined
        ? overrides.promptContext
        : createBasePromptContext(),
    intentOverride: overrides.intentOverride,
  });
}
