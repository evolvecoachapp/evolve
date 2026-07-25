import { buildRecoveryDescriptor } from "../builders/DescriptorBuilder";
import { buildRecoveryAdaptation } from "../builders/RecoveryAdaptationBuilder";
import { buildRecoveryResult } from "../builders/ResultBuilder";
import { RecoveryOperationKinds } from "../models/RecoveryResult";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("recovery-adaptation builders", () => {
  it("freezes built artifacts", () => {
    const adaptation = buildRecoveryAdaptation({
      id: "na:1",
      athleteId: "athlete:1",
      planId: "plan:1",
      contextId: "context:1",
      decisionKeys: Object.freeze(["decision:key:sleep"]),
      signalKeys: Object.freeze(["state:stress"]),
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(adaptation)).toBe(true);

    const descriptor = buildRecoveryDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.version).toBe("24.2.0");
    expect(Object.isFrozen(descriptor)).toBe(true);

    const result = buildRecoveryResult({
      id: "result:1",
      operation: RecoveryOperationKinds.ADAPT,
      success: true,
      adaptation,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
