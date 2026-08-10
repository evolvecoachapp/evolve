import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { publishWorkoutCompletion } from "../../../integrations/workout-progress/application";
import { mapWorkoutRuntimeToSessionSummary } from "../mappers/mapWorkoutRuntimeToSessionSummary";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";

export interface PublishWorkoutRuntimeCompletionOptions {
  readonly runtime: WorkoutRuntime;
  readonly athleteId: string;
  readonly programName?: string | null;
  readonly completedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes a natural workout completion event to the Sprint 32.1 integration. */
export async function publishWorkoutRuntimeCompletion({
  runtime,
  athleteId,
  programName = null,
  completedAt,
  correlationId = `workout-runtime:${runtime.id}`,
  eventId = `workout-runtime:complete:${runtime.id}:${completedAt}`,
  publishedAt = completedAt,
}: PublishWorkoutRuntimeCompletionOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("WorkoutProgressPublisher");
  const summary = mapWorkoutRuntimeToSessionSummary({
    runtime,
    programName,
    completedAt,
  });

  await publishWorkoutCompletion({
    publisher,
    summary,
    correlationId,
    eventId,
    publishedAt,
    athleteId,
  });
}
