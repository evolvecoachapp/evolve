import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { validateUnifiedContextFull } from "../validators/validateUnifiedContext";
import { validateSnapshotIntegrity } from "../validators/validateSnapshotIntegrity";
import { buildContextSnapshot } from "../builders/SnapshotBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion validators", () => {
  it("validates empty context integrity", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const result = validateUnifiedContextFull(context);
    expect(result.valid).toBe(true);
  });

  it("rejects missing athleteId", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "",
      at: FIXED_TIMESTAMP,
    });
    const result = validateUnifiedContextFull(context);
    expect(result.valid).toBe(false);
  });

  it("validates snapshot integrity", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const snapshot = buildContextSnapshot({
      id: "snapshot:1",
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(validateSnapshotIntegrity(snapshot).valid).toBe(true);
  });
});
