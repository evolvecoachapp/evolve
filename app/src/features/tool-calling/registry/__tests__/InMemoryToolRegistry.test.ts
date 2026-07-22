import { InMemoryToolRegistry } from "../InMemoryToolRegistry";
import { GetAthleteProfileTool } from "../../tools/placeholders/GetAthleteProfileTool";
import { GetCoachSummaryTool } from "../../tools/placeholders/GetCoachSummaryTool";
import { ToolError } from "../../models/ToolError";
import { freezeToolRegistry } from "../../utils/freezeToolRegistry";

describe("InMemoryToolRegistry", () => {
  it("registers tools and looks them up by name", () => {
    const registry = new InMemoryToolRegistry();
    const tool = new GetAthleteProfileTool();

    registry.register(tool);

    expect(registry.has("get_athlete_profile")).toBe(true);
    expect(registry.get("get_athlete_profile")).toBe(tool);
    expect(registry.list()).toHaveLength(1);
  });

  it("rejects duplicate tool names", () => {
    const registry = new InMemoryToolRegistry();
    registry.register(new GetAthleteProfileTool());

    expect(() => registry.register(new GetAthleteProfileTool())).toThrow(
      ToolError,
    );
  });

  it("lists unique capabilities", () => {
    const registry = new InMemoryToolRegistry();
    registry.register(new GetAthleteProfileTool());
    registry.register(new GetCoachSummaryTool());

    expect(registry.listCapabilities()).toEqual(
      expect.arrayContaining(["athlete_profile", "coach_summary"]),
    );
  });

  it("becomes immutable after freeze", () => {
    const registry = new InMemoryToolRegistry();
    registry.register(new GetAthleteProfileTool());
    freezeToolRegistry(registry);

    expect(registry.isFrozen()).toBe(true);
    expect(() => registry.register(new GetCoachSummaryTool())).toThrow(
      ToolError,
    );
  });
});
