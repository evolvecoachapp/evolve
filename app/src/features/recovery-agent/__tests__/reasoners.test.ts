import { RecoveryContextBuilder } from "../builders/RecoveryContextBuilder";
import { createDefaultReasoners } from "../reasoning";
import {
  createRecoveryRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";

describe("recovery-agent reasoners", () => {
  it("produces frozen reasoning for all default reasoners", () => {
    const context = new RecoveryContextBuilder().build({
      request: createRecoveryRequestFixture(),
      clock: createFixedClock(),
    });
    const results = createDefaultReasoners().map((r) => r.reason(context));
    expect(results.length).toBeGreaterThanOrEqual(10);
    for (const r of results) {
      expect(Object.isFrozen(r)).toBe(true);
      expect(r.findings.length).toBeGreaterThan(0);
    }
  });
});
