import { resolveConflicts } from "../resolution/ConflictResolver";
import { resolvePriorities, preferSource } from "../resolution/PriorityResolver";
import { ContextConflictKinds } from "../models/ContextConflict";

describe("context-fusion resolution", () => {
  it("prefers athlete over workout by deterministic priority", () => {
    const priorities = resolvePriorities();
    expect(preferSource(priorities, "athlete", "workout")).toBe("athlete");
  });

  it("resolves conflicts by priority strategy", () => {
    const priorities = resolvePriorities();
    const resolutions = resolveConflicts({
      priorities,
      conflicts: [
        Object.freeze({
          id: "conflict:focus",
          kind: ContextConflictKinds.FIELD,
          path: "focus",
          sources: Object.freeze(["athlete", "workout"] as const),
          values: Object.freeze(["ready", "strength"]),
          notes: Object.freeze([] as string[]),
        }),
      ],
    });
    expect(resolutions).toHaveLength(1);
    expect(resolutions[0]!.winnerSource).toBe("athlete");
    expect(resolutions[0]!.strategy).toBe("priority");
  });
});
