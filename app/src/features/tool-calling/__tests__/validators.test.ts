import { createEchoTool, createToolCallRequest } from "../testSupport/fixtures";
import { FoundationToolRegistry } from "../registry/InMemoryToolRegistry";
import { createToolValidator } from "../validators/ToolValidator";
import { validateCallRequest } from "../validators/validateCallRequest";
import { validateExecutionContext } from "../validators/validateExecutionContext";
import { validateExecutionResult } from "../validators/validateExecutionResult";
import { validateParameters } from "../validators/validateParameters";
import { validateSchema } from "../validators/validateSchema";
import { validateToolId } from "../validators/validateToolId";

describe("tool-calling foundation validators", () => {
  it("validates tool ids", () => {
    expect(validateToolId("")).toContain("missing_tool_id");
    expect(validateToolId("9bad")).toContain("invalid_tool_id_format");
    expect(validateToolId("echo_tool")).toEqual([]);
  });

  it("validates schemas and parameters", () => {
    const schema = createEchoTool().definition().schema;
    expect(validateSchema(schema)).toEqual([]);
    expect(validateParameters({ parameters: {} }, schema)).toContain(
      "missing_required_parameter",
    );
    expect(
      validateParameters({ parameters: { message: "x", extra: 1 } }, schema),
    ).toContain("unknown_parameter");
    expect(
      validateParameters({ parameters: { message: "x" } }, schema),
    ).toEqual([]);
  });

  it("validates execution context and results", () => {
    expect(validateExecutionContext({
      conversationId: null,
      athleteId: null,
      streamId: null,
      executionRequestId: null,
      now: "",
      attributes: {},
    })).toContain("missing_now");

    expect(
      validateExecutionResult({
        output: null,
        error: null,
        status: "succeeded",
        durationMs: 1,
      }),
    ).toContain("missing_output_on_success");

    expect(
      validateExecutionResult({
        output: { data: 1 },
        error: null,
        status: "succeeded",
        durationMs: 1,
      }),
    ).toEqual([]);
  });

  it("validates call requests", () => {
    const valid = createToolCallRequest();
    expect(validateCallRequest(valid)).toEqual([]);
    expect(validateCallRequest(Object.freeze({ ...valid, id: "" }))).toContain(
      "missing_request_id",
    );
  });

  it("ToolValidator wires all checks", () => {
    const validator = createToolValidator();
    const registry = new FoundationToolRegistry();
    registry.register(createEchoTool());

    expect(validator.validateToolId("echo")).toEqual([]);
    expect(validator.validateRegistryIntegrity(registry)).toEqual([]);
    expect(validator.validateCallRequest(createToolCallRequest())).toEqual([]);
  });
});
