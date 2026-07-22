import { ToolError } from "../../models/ToolError";
import { InMemoryToolRegistry } from "../../registry/InMemoryToolRegistry";
import { ToolExecutor } from "../ToolExecutor";
import { GetAthleteProfileTool } from "../../tools/placeholders/GetAthleteProfileTool";
import { SaveCoachNoteTool } from "../../tools/placeholders/SaveCoachNoteTool";
import {
  createToolContext,
  createToolRequest,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("ToolExecutor", () => {
  function createExecutor() {
    const registry = new InMemoryToolRegistry();
    registry.register(new GetAthleteProfileTool());
    registry.register(new SaveCoachNoteTool());
    registry.freeze();
    return new ToolExecutor(registry);
  }

  it("executes a resolved tool and returns a succeeded ToolResult", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createToolRequest({ toolName: "get_athlete_profile" }),
      createToolContext(),
    );

    expect(result.status).toBe("succeeded");
    expect(result.toolName).toBe("get_athlete_profile");
    expect(result.error).toBeNull();
    expect(result.data).toMatchObject({
      kind: "athlete_profile",
      placeholder: true,
      capturedAt: FIXED_TIMESTAMP,
    });
  });

  it("throws when the tool is not registered", async () => {
    const executor = createExecutor();

    await expect(
      executor.execute(
        createToolRequest({ toolName: "missing_tool" }),
        createToolContext(),
      ),
    ).rejects.toBeInstanceOf(ToolError);
  });

  it("returns failed ToolResult for invalid arguments", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createToolRequest({
        toolName: "save_coach_note",
        arguments: Object.freeze([]),
      }),
      createToolContext(),
    );

    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("invalid_arguments");
  });

  it("executes save_coach_note with a valid note", async () => {
    const executor = createExecutor();
    const result = await executor.execute(
      createToolRequest({
        toolName: "save_coach_note",
        arguments: Object.freeze([
          Object.freeze({ name: "note", value: "Focus on recovery" }),
        ]),
      }),
      createToolContext(),
    );

    expect(result.status).toBe("succeeded");
    expect(result.data).toMatchObject({
      kind: "coach_note",
      saved: true,
      note: "Focus on recovery",
    });
  });
});
