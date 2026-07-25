import { planRecoveryAdaptation } from "../planning";

describe("recovery-adaptation planning", () => {
  it("returns immutable plan step/target keys from decision keys", () => {
    const plans = planRecoveryAdaptation({
      id: "plan-test",
      decisionKeys: Object.freeze([
        "decision:key:sleep",
        "decision:key:protocol",
        "decision:key:stress",
      ]),
      signalKeys: Object.freeze(["state:stress"]),
      planKeys: Object.freeze(["plan:1"]),
      sleepKeys: Object.freeze(["day:breakfast"]),
      protocolKeys: Object.freeze(["protocol:fatigue"]),
      mobilityKeys: Object.freeze(["timing:pre"]),
      weekKeys: Object.freeze(["week:1"]),
    });
    expect(Object.isFrozen(plans)).toBe(true);
    expect(Object.isFrozen(plans.recovery)).toBe(true);
    expect(plans.recovery.stepKeys.length).toBeGreaterThan(0);
    expect(plans.day.targetKeys).toContain("target:day:breakfast");
    expect(plans.protocol.stepKeys.some((k) => k.includes("protocol") || k.includes("sleep"))).toBe(
      true,
    );
  });
});
