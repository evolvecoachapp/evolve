import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { applyIntegrityPolicy } from "../policies/IntegrityPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applyVersionPolicy } from "../policies/VersionPolicy";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion policies", () => {
  it("passes integrity, version, and priority policies on empty context", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(applyIntegrityPolicy(context).valid).toBe(true);
    expect(applyVersionPolicy(context).valid).toBe(true);
    expect(applyPriorityPolicy(context).valid).toBe(true);
  });
});
