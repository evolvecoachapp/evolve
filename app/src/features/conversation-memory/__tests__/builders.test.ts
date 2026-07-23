import {
  buildMemoryContext,
  buildMemoryEntry,
  buildMemoryQuery,
  buildMemoryResult,
  buildMemorySnapshot,
  buildMemorySummary,
} from "../builders";
import { MemoryCategories } from "../models/MemoryCategory";
import { MemoryOperationKinds } from "../models/MemoryResult";
import { MemoryQueryModes } from "../models/MemoryQuery";
import { MemoryScopes } from "../models/MemoryScope";
import {
  createContextEntry,
  createDecisionEntry,
  createProfileEntry,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-memory builders", () => {
  it("builds frozen entry / query / context", () => {
    const entry = buildMemoryEntry({
      id: "mem:1",
      category: MemoryCategories.GOAL,
      key: "goal",
      value: "build muscle",
      createdAt: FIXED_TIMESTAMP,
      scope: MemoryScopes.ATHLETE,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(entry.identifier.key).toBe("goal");

    const query = buildMemoryQuery({
      id: "q:1",
      createdAt: FIXED_TIMESTAMP,
      mode: MemoryQueryModes.LATEST,
      limit: 3,
    });
    expect(query.latestOnly).toBe(true);
    expect(Object.isFrozen(query)).toBe(true);

    const context = buildMemoryContext({
      id: "ctx:1",
      createdAt: FIXED_TIMESTAMP,
      entries: [createContextEntry(), createProfileEntry()],
    });
    expect(context.entryCount).toBe(1);
    expect(Object.isFrozen(context)).toBe(true);
  });

  it("builds snapshot / summary / result", () => {
    const entries = [
      createProfileEntry(),
      createContextEntry(),
      createDecisionEntry(),
    ];
    const snapshot = buildMemorySnapshot({
      id: "snap:1",
      createdAt: FIXED_TIMESTAMP,
      entries,
      athleteId: "athlete-1",
      conversationId: "conv-1",
    });
    expect(snapshot.entryCount).toBe(3);
    expect(snapshot.profile.entryCount).toBe(1);
    expect(snapshot.decision.acceptedCount).toBe(1);
    expect(Object.isFrozen(snapshot)).toBe(true);

    const summary = buildMemorySummary({
      id: "sum:1",
      createdAt: FIXED_TIMESTAMP,
      entries,
    });
    expect(summary.profileCount).toBe(1);
    expect(summary.contextCount).toBe(1);
    expect(summary.decisionCount).toBe(1);

    const result = buildMemoryResult({
      id: "res:1",
      operation: MemoryOperationKinds.SNAPSHOT,
      success: true,
      message: "ok",
      entries,
      snapshot,
      summary,
      validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
      startedAt: FIXED_TIMESTAMP,
      completedAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});
