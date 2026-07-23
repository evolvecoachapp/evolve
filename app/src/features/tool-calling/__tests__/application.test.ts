import {
  describeTool,
  executeTool,
  listTools,
  snapshotRegistry,
} from "../application";
import {
  createTestToolCallingHarness,
  createToolCallRequest,
} from "../testSupport/fixtures";

describe("tool-calling application API", () => {
  it("executeTool runs through the public API", async () => {
    const { service } = createTestToolCallingHarness();

    const result = await executeTool({
      service,
      toolId: "echo",
      parameters: { message: "api" },
    });

    expect(result.response.status).toBe("succeeded");
    expect(result.result.output?.data).toEqual({ echo: "api" });
  });

  it("executeTool accepts a prebuilt request", async () => {
    const { service } = createTestToolCallingHarness();
    const request = createToolCallRequest({
      parameters: { message: "req" },
    });

    const result = await executeTool({ service, toolId: "echo", request });
    expect(result.response.status).toBe("succeeded");
  });

  it("listTools and describeTool expose descriptors only", () => {
    const { service } = createTestToolCallingHarness();

    expect(listTools({ service })).toHaveLength(1);
    expect(describeTool({ service, toolId: "echo" })?.id).toBe("echo");
    expect(describeTool({ service, toolId: "missing" })).toBeNull();
  });

  it("snapshotRegistry returns an immutable snapshot", () => {
    const { service } = createTestToolCallingHarness();
    const snapshot = snapshotRegistry({
      service,
      capturedAt: "2026-07-23T00:00:00.000Z",
    });

    expect(snapshot.toolCount).toBe(1);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("throws when service/registry is missing", async () => {
    await expect(
      executeTool({ toolId: "echo", parameters: { message: "x" } }),
    ).rejects.toThrow(/requires a ToolCallingService or registry/);
  });
});
