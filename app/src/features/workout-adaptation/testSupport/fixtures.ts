import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockWorkoutBlueprintPort } from "../contracts/WorkoutBlueprintPort";
import { createMockWorkoutRuntimePort } from "../contracts/WorkoutRuntimePort";
import { WorkoutAdaptationInputKinds } from "../models/WorkoutAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import { EMPTY_WORKOUT_METADATA } from "../models/WorkoutMetadata";
import {
  createWorkoutAdaptationEngineService,
  type WorkoutAdaptationEngineService,
} from "../services/WorkoutAdaptationEngineService";
import { freezeInput } from "../utils/FreezeWorkoutAdaptation";

export const FIXED_TIMESTAMP = "2026-07-26T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createWorkoutAdaptationInput(
  overrides: Partial<WorkoutAdaptationInput> = {},
): WorkoutAdaptationInput {
  return freezeInput({
    id: overrides.id ?? "request:workout-adaptation:test",
    kind: overrides.kind ?? WorkoutAdaptationInputKinds.ADAPT,
    athleteId: overrides.athleteId ?? "athlete:1",
    blueprintId: overrides.blueprintId ?? "blueprint:1",
    sessionId: overrides.sessionId ?? "session:1",
    contextId: overrides.contextId ?? "context:1",
    blueprintKeys:
      overrides.blueprintKeys ??
      Object.freeze(["blueprint:1", "blueprint:structure", "blueprint:session:a"]),
    dayKeys: overrides.dayKeys ?? Object.freeze(["day:blueprint:1:1", "day:blueprint:1:2"]),
    exerciseKeys:
      overrides.exerciseKeys ??
      Object.freeze(["exercise:blueprint:1:squat", "exercise:blueprint:1:bench"]),
    sessionKeys:
      overrides.sessionKeys ??
      Object.freeze(["session:blueprint:1:a", "session:blueprint:1:b"]),
    weekKeys:
      overrides.weekKeys ?? Object.freeze(["week:blueprint:1:1", "week:blueprint:1:2"]),
    decisionKeys:
      overrides.decisionKeys ??
      Object.freeze([
        "decision:key:athlete:1:volume",
        "decision:key:athlete:1:intensity",
        "decision:key:progression",
      ]),
    signalKeys:
      overrides.signalKeys ??
      Object.freeze(["state:readiness", "state:fatigue", "state:recovery"]),
    signalFlags:
      overrides.signalFlags ??
      Object.freeze({
        "volume:flag": true,
        "intensity:flag": true,
        "recovery:flag": true,
      }),
    priorSnapshot: overrides.priorSnapshot ?? null,
    decisionRef: overrides.decisionRef ?? null,
    blueprintRef: overrides.blueprintRef ?? null,
    runtimeRef: overrides.runtimeRef ?? null,
    athleteStateRef: overrides.athleteStateRef ?? null,
    coachContextRef: overrides.coachContextRef ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_WORKOUT_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestWorkoutAdaptationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): WorkoutAdaptationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createWorkoutAdaptationEngineService({
    workoutBlueprintPort: withMocks ? createMockWorkoutBlueprintPort() : undefined,
    workoutRuntimePort: withMocks ? createMockWorkoutRuntimePort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    continuousAdaptationPort: withMocks ? createMockContinuousAdaptationPort() : undefined,
    coachContextPort: withMocks ? createMockCoachContextPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
