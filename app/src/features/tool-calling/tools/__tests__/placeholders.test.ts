import { GetAthleteProfileTool } from "../placeholders/GetAthleteProfileTool";
import { GetCoachSummaryTool } from "../placeholders/GetCoachSummaryTool";
import { GetMemoryContextTool } from "../placeholders/GetMemoryContextTool";
import { GetWorkoutHistoryTool } from "../placeholders/GetWorkoutHistoryTool";
import { GetWorkoutSummaryTool } from "../placeholders/GetWorkoutSummaryTool";
import { SaveCoachNoteTool } from "../placeholders/SaveCoachNoteTool";
import { createDefaultToolRegistry } from "../../services/createToolExecutor";
import { createToolContext, FIXED_TIMESTAMP } from "../../testSupport/fixtures";

describe("placeholder tools", () => {
  const context = createToolContext();

  it("exposes stable names and capabilities", () => {
    expect(new GetAthleteProfileTool().name()).toBe("get_athlete_profile");
    expect(new GetWorkoutSummaryTool().capabilities()).toEqual([
      "workout_summary",
    ]);
    expect(new GetWorkoutHistoryTool().name()).toBe("get_workout_history");
    expect(new GetCoachSummaryTool().name()).toBe("get_coach_summary");
    expect(new GetMemoryContextTool().name()).toBe("get_memory_context");
    expect(new SaveCoachNoteTool().capabilities()).toEqual(["coach_note"]);
  });

  it("executes locally with placeholder payloads", async () => {
    const profile = await new GetAthleteProfileTool().execute([], context);
    const summary = await new GetWorkoutSummaryTool().execute([], context);
    const history = await new GetWorkoutHistoryTool().execute(
      [Object.freeze({ name: "limit", value: 2 })],
      context,
    );
    const coach = await new GetCoachSummaryTool().execute([], context);
    const memory = await new GetMemoryContextTool().execute([], context);
    const note = await new SaveCoachNoteTool().execute(
      [Object.freeze({ name: "note", value: "Deload week" })],
      context,
    );

    expect(profile).toMatchObject({
      kind: "athlete_profile",
      placeholder: true,
      capturedAt: FIXED_TIMESTAMP,
    });
    expect(summary).toMatchObject({ kind: "workout_summary", placeholder: true });
    expect(history).toMatchObject({ kind: "workout_history", limit: 2 });
    expect(coach).toMatchObject({ kind: "coach_summary", placeholder: true });
    expect(memory).toMatchObject({ kind: "memory_context", placeholder: true });
    expect(note).toMatchObject({
      kind: "coach_note",
      saved: true,
      note: "Deload week",
    });
  });

  it("createDefaultToolRegistry registers all placeholders and freezes", () => {
    const registry = createDefaultToolRegistry();

    expect(registry.isFrozen()).toBe(true);
    expect([...registry.list()].map((tool) => tool.name()).sort()).toEqual([
      "get_athlete_profile",
      "get_coach_summary",
      "get_memory_context",
      "get_workout_history",
      "get_workout_summary",
      "save_coach_note",
    ]);
  });
});
