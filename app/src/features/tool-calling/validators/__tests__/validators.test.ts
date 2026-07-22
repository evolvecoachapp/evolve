import {
  validateArguments,
  validateRequest,
  validateResult,
  validateTool,
  validateToolDefinition,
} from "../index";
import { GetAthleteProfileTool } from "../../tools/placeholders/GetAthleteProfileTool";
import { ToolError } from "../../models/ToolError";
import {
  createToolDefinition,
  createToolRequest,
  createToolResult,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";

describe("tool-calling validators", () => {
  it("validateTool accepts placeholder tools", () => {
    expect(validateTool(new GetAthleteProfileTool())).toEqual([]);
  });

  it("validateToolDefinition rejects missing name", () => {
    expect(
      validateToolDefinition(createToolDefinition({ name: "" })),
    ).toContain("missing_name");
  });

  it("validateRequest accepts a well-formed request", () => {
    expect(validateRequest(createToolRequest())).toEqual([]);
  });

  it("validateRequest rejects missing tool name", () => {
    expect(
      validateRequest(createToolRequest({ toolName: "" })),
    ).toContain("missing_tool_name");
  });

  it("validateArguments detects duplicates and tool rejection", () => {
    expect(
      validateArguments([
        Object.freeze({ name: "limit", value: 1 }),
        Object.freeze({ name: "limit", value: 2 }),
      ]),
    ).toContain("duplicate_argument_name");

    expect(
      validateArguments(
        [Object.freeze({ name: "unexpected", value: true })],
        new GetAthleteProfileTool(),
      ),
    ).toContain("tool_rejected_arguments");
  });

  it("validateResult enforces status/error consistency", () => {
    expect(validateResult(createToolResult())).toEqual([]);
    expect(
      validateResult(
        createToolResult({
          status: "failed",
          error: null,
          data: null,
        }),
      ),
    ).toContain("error_status_mismatch");

    expect(
      validateResult(
        createToolResult({
          status: "succeeded",
          error: new ToolError("x", "y"),
          completedAt: FIXED_TIMESTAMP,
        }),
      ),
    ).toContain("error_status_mismatch");
  });
});
