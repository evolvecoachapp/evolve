import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockRecoveryPlanPort } from "../contracts/RecoveryPlanPort";
import { createMockRecoveryRuntimePort } from "../contracts/RecoveryRuntimePort";
import { RecoveryAdaptationInputKinds } from "../models/RecoveryAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import { EMPTY_RECOVERY_METADATA } from "../models/RecoveryMetadata";
import {
  createRecoveryAdaptationEngineService,
  type RecoveryAdaptationEngineService,
} from "../services/RecoveryAdaptationEngineService";
import { freezeInput } from "../utils/FreezeRecoveryAdaptation";

export const FIXED_TIMESTAMP = "2026-07-26T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createRecoveryAdaptationInput(
  overrides: Partial<RecoveryAdaptationInput> = {},
): RecoveryAdaptationInput {
  return freezeInput({
    id: overrides.id ?? "request:recovery-adaptation:test",
    kind: overrides.kind ?? RecoveryAdaptationInputKinds.ADAPT,
    athleteId: overrides.athleteId ?? "athlete:1",
    planId: overrides.planId ?? "plan:1",
    sessionId: overrides.sessionId ?? "session:1",
    contextId: overrides.contextId ?? "context:1",
    planKeys:
      overrides.planKeys ??
      Object.freeze(["plan:1", "plan:structure", "plan:day:breakfast"]),
    dayKeys: overrides.dayKeys ?? Object.freeze(["day:plan:1:1", "day:plan:1:2"]),
    sleepKeys:
      overrides.sleepKeys ??
      Object.freeze(["day:plan:1:breakfast", "day:plan:1:lunch", "day:plan:1:dinner"]),
    protocolKeys:
      overrides.protocolKeys ??
      Object.freeze(["protocol:plan:1:fatigue", "protocol:plan:1:readiness", "protocol:plan:1:fat"]),
    mobilityKeys:
      overrides.mobilityKeys ??
      Object.freeze(["timing:plan:1:pre", "timing:plan:1:post"]),
    weekKeys:
      overrides.weekKeys ?? Object.freeze(["week:plan:1:1", "week:plan:1:2"]),
    decisionKeys:
      overrides.decisionKeys ??
      Object.freeze([
        "decision:key:athlete:1:sleep",
        "decision:key:athlete:1:protocol",
        "decision:key:stress",
      ]),
    signalKeys:
      overrides.signalKeys ??
      Object.freeze(["state:hrv", "state:stress", "state:recovery"]),
    signalFlags:
      overrides.signalFlags ??
      Object.freeze({
        "sleep:flag": true,
        "protocol:flag": true,
        "stress:flag": true,
      }),
    priorSnapshot: overrides.priorSnapshot ?? null,
    decisionRef: overrides.decisionRef ?? null,
    planRef: overrides.planRef ?? null,
    runtimeRef: overrides.runtimeRef ?? null,
    athleteStateRef: overrides.athleteStateRef ?? null,
    coachContextRef: overrides.coachContextRef ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_RECOVERY_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestRecoveryAdaptationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): RecoveryAdaptationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createRecoveryAdaptationEngineService({
    recoveryPlanPort: withMocks ? createMockRecoveryPlanPort() : undefined,
    recoveryRuntimePort: withMocks ? createMockRecoveryRuntimePort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    continuousAdaptationPort: withMocks ? createMockContinuousAdaptationPort() : undefined,
    coachContextPort: withMocks ? createMockCoachContextPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
