import { createToolExecutor } from "../services/createToolExecutor";
import {
  createToolContext,
  createToolRequest,
  createTestToolCallingHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { executeTool } from "../application";
import { isToolRequest } from "../utils/isToolRequest";

describe("tool-calling regression", () => {
  it("preserves legacy ToolExecutor + placeholder registry behavior", async () => {
    const executor = createToolExecutor();
    const result = await executor.execute(
      createToolRequest({ toolName: "get_athlete_profile" }),
      createToolContext(),
    );

    expect(result.status).toBe("succeeded");
    expect(result.toolName).toBe("get_athlete_profile");
    expect(result.data).toMatchObject({
      kind: "athlete_profile",
      placeholder: true,
      capturedAt: FIXED_TIMESTAMP,
    });
  });

  it("preserves isToolRequest type guard", () => {
    expect(isToolRequest(createToolRequest())).toBe(true);
    expect(isToolRequest({ toolName: "x" })).toBe(false);
  });

  it("foundation API coexists with legacy executor", async () => {
    const { service } = createTestToolCallingHarness();
    const foundation = await executeTool({
      service,
      toolId: "echo",
      parameters: { message: "coexist" },
    });
    expect(foundation.response.status).toBe("succeeded");

    const legacy = await createToolExecutor().execute(
      createToolRequest({ toolName: "get_athlete_profile" }),
      createToolContext(),
    );
    expect(legacy.status).toBe("succeeded");
  });
});
