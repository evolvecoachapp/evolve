import { applyAdaptationPolicy } from "../policies/AdaptationPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyDetectionPolicy } from "../policies/DetectionPolicy";
import { applyMonitoringPolicy } from "../policies/MonitoringPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";

describe("continuous-adaptation policies", () => {
  it("passes structural policies on successful evaluate path", () => {
    const service = createTestContinuousAdaptationEngineService();
    const input = createAdaptationInput();
    const result = service.evaluateAdaptation(input);
    expect(result.success).toBe(true);

    expect(applyMonitoringPolicy(input)).toHaveLength(0);
    expect(applyDetectionPolicy(result.decisions[0]!.triggers)).toHaveLength(0);
    expect(applyAdaptationPolicy(result.decisions)).toHaveLength(0);
    expect(applyConsistencyPolicy(result.decisions)).toHaveLength(0);
    expect(applyPriorityPolicy(result.decisions)).toHaveLength(0);
    expect(applySafetyPolicy(result.package!)).toHaveLength(0);
  });

  it("flags missing athlete for monitoring policy", () => {
    const input = createAdaptationInput({ athleteId: "" });
    expect(applyMonitoringPolicy(input).length).toBeGreaterThan(0);
  });
});
