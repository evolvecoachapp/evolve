import { createMemoryQueryEngine } from "../queries";
import { buildMemoryQuery } from "../builders";
import { MemoryCategories } from "../models/MemoryCategory";
import { MemoryPriorities } from "../models/MemoryPriority";
import { MemoryQueryModes } from "../models/MemoryQuery";
import { MemoryScopes } from "../models/MemoryScope";
import {
  createContextEntry,
  createDecisionEntry,
  createProfileEntry,
  FIXED_TIMESTAMP,
  FIXED_TIMESTAMP_LATER,
} from "../testSupport/fixtures";

describe("conversation-memory queries", () => {
  const engine = createMemoryQueryEngine();
  const entries = [
    createProfileEntry({
      id: "p1",
      updatedAt: FIXED_TIMESTAMP,
      priority: MemoryPriorities.HIGH,
    }),
    createContextEntry({
      id: "c1",
      updatedAt: FIXED_TIMESTAMP_LATER,
      priority: MemoryPriorities.NORMAL,
    }),
    createDecisionEntry({
      id: "d1",
      updatedAt: FIXED_TIMESTAMP,
      priority: MemoryPriorities.CRITICAL,
    }),
  ];

  it("supports category / identifier / priority / scope / time / latest / historical", () => {
    expect(engine.byCategory(entries, MemoryCategories.CONTEXT)).toHaveLength(
      1,
    );
    expect(engine.byIdentifier(entries, "d1")?.category).toBe(
      MemoryCategories.DECISION,
    );
    expect(engine.byPriority(entries, MemoryPriorities.HIGH)).toHaveLength(2);
    expect(engine.byScope(entries, MemoryScopes.ATHLETE)).toHaveLength(1);
    expect(
      engine.byTime(entries, FIXED_TIMESTAMP_LATER, null),
    ).toHaveLength(1);

    const latest = engine.query(
      entries,
      buildMemoryQuery({
        id: "q:latest",
        createdAt: FIXED_TIMESTAMP,
        mode: MemoryQueryModes.LATEST,
        limit: 1,
      }),
    );
    expect(latest[0]?.id).toBe("d1");

    const historical = engine.historical(entries);
    expect(historical[0]?.updatedAt).toBe(FIXED_TIMESTAMP);
  });
});
