import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { buildContextSnapshot } from "../builders/SnapshotBuilder";
import { buildContextSummary } from "../builders/SummaryBuilder";
import { buildContextPackage } from "../builders/PackageBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion builders", () => {
  it("builds empty immutable context, summary, snapshot, package", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(context)).toBe(true);
    const summary = buildContextSummary({
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(summary.athleteId).toBe("athlete:1");
    const snapshot = buildContextSnapshot({
      id: "snapshot:1",
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(snapshot.contextId).toBe("context:1");
    const pkg = buildContextPackage({
      id: "package:1",
      context,
      snapshot,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(pkg.decisionEngineContext).not.toBeNull();
  });
});
