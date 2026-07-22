import { InMemoryToolRegistry } from "../../registry/InMemoryToolRegistry";
import { GetAthleteProfileTool } from "../../tools/placeholders/GetAthleteProfileTool";
import { deepCloneToolRequest } from "../deepCloneToolRequest";
import { freezeToolRegistry } from "../freezeToolRegistry";
import { isToolRequest } from "../isToolRequest";
import { normalizeArguments } from "../normalizeArguments";
import { rankCapabilities } from "../rankCapabilities";
import { createToolRequest } from "../../testSupport/fixtures";

describe("tool-calling utilities", () => {
  it("freezeToolRegistry blocks further registration", () => {
    const registry = new InMemoryToolRegistry();
    registry.register(new GetAthleteProfileTool());
    freezeToolRegistry(registry);
    expect(registry.isFrozen()).toBe(true);
  });

  it("rankCapabilities orders by catalog sequence", () => {
    expect(
      rankCapabilities(["coach_note", "athlete_profile", "memory_context"]),
    ).toEqual(["athlete_profile", "memory_context", "coach_note"]);
  });

  it("normalizeArguments trims, clones, and sorts", () => {
    const normalized = normalizeArguments([
      Object.freeze({ name: " zeta ", value: { nested: 1 } }),
      Object.freeze({ name: "alpha", value: "x" }),
    ]);

    expect(normalized.map((arg) => arg.name)).toEqual(["alpha", "zeta"]);
    expect(normalized[0]?.value).toBe("x");
    expect(normalized[1]?.value).toEqual({ nested: 1 });
    expect(Object.isFrozen(normalized[1]?.value)).toBe(true);
  });

  it("deepCloneToolRequest freezes a copy", () => {
    const request = createToolRequest({
      arguments: Object.freeze([
        Object.freeze({ name: "limit", value: 3 }),
      ]),
    });
    const cloned = deepCloneToolRequest(request);

    expect(cloned).toEqual({
      ...request,
      arguments: Object.freeze([
        Object.freeze({ name: "limit", value: 3 }),
      ]),
    });
    expect(cloned).not.toBe(request);
    expect(Object.isFrozen(cloned)).toBe(true);
  });

  it("isToolRequest distinguishes requests from responses", () => {
    expect(isToolRequest(createToolRequest())).toBe(true);
    expect(
      isToolRequest({
        message: { role: "assistant" },
        finishReason: "stop",
      }),
    ).toBe(false);
  });
});
