import { adaptRecovery, createRecoverySnapshot } from "../application";
import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockRecoveryPlanPort } from "../contracts/RecoveryPlanPort";
import { createMockRecoveryRuntimePort } from "../contracts/RecoveryRuntimePort";
import { createRecoveryAdaptationEngineService } from "../services";
import {
  createFixedClock,
  createRecoveryAdaptationInput,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recovery-adaptation integration", () => {
  it("resolves upstream ports and produces runtime handoff", () => {
    const service = createRecoveryAdaptationEngineService({
      recoveryPlanPort: createMockRecoveryPlanPort(),
      recoveryRuntimePort: createMockRecoveryRuntimePort(),
      athleteStatePort: createMockAthleteStatePort(),
      continuousAdaptationPort: createMockContinuousAdaptationPort(),
      coachContextPort: createMockCoachContextPort(),
      clock: createFixedClock(),
    });

    const input = createRecoveryAdaptationInput({
      planKeys: Object.freeze([]),
      sleepKeys: Object.freeze([]),
      protocolKeys: Object.freeze([]),
      mobilityKeys: Object.freeze([]),
      weekKeys: Object.freeze([]),
      dayKeys: Object.freeze([]),
      decisionKeys: Object.freeze([]),
      signalKeys: Object.freeze([]),
    });

    const result = adaptRecovery({ service, input });
    expect(result.success).toBe(true);
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.updatedPlan?.planId).toBe("plan:1");
    expect(result.updatedPlan!.sleepKeys.length).toBeGreaterThan(0);
    expect(result.runtimeInput?.updatedPlanId).toBe(result.updatedPlan!.id);
    expect(result.adaptation!.decisionKeys.length).toBeGreaterThan(0);

    const snap = createRecoverySnapshot({ service, input });
    expect(snap.success).toBe(true);
    expect(snap.snapshot?.modificationIds.length).toBeGreaterThan(0);
  });

  it("does not generate from empty plan without keys or port data", () => {
    const service = createRecoveryAdaptationEngineService({
      clock: createFixedClock(),
    });
    const result = adaptRecovery({
      service,
      input: createRecoveryAdaptationInput({
        planKeys: Object.freeze([]),
        sleepKeys: Object.freeze([]),
        protocolKeys: Object.freeze([]),
        mobilityKeys: Object.freeze([]),
        weekKeys: Object.freeze([]),
        dayKeys: Object.freeze([]),
      }),
    });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.code === "empty_plan")).toBe(true);
  });
});
