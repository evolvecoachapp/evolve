import { createEchoTool } from "../testSupport/fixtures";
import {
  FoundationToolRegistry,
  InMemoryToolRegistry,
} from "../registry/InMemoryToolRegistry";
import { GetAthleteProfileTool } from "../tools/placeholders/GetAthleteProfileTool";
import { ToolError } from "../models/ToolError";
import { validateRegistryIntegrity } from "../validators/validateRegistryIntegrity";

describe("Tool Registry (foundation)", () => {
  it("registers, resolves, and lists foundation tools", () => {
    const registry = new FoundationToolRegistry();
    const echo = createEchoTool();

    registry.register(echo);

    expect(registry.has("echo")).toBe(true);
    expect(registry.resolve("echo")).toBe(echo);
    expect(registry.list()).toHaveLength(1);
    expect(registry.listDescriptors()[0]?.id).toBe("echo");
    expect(registry.listByCategory("utility")).toHaveLength(1);
  });

  it("normalizes tool ids on resolve", () => {
    const registry = new FoundationToolRegistry();
    registry.register(createEchoTool({ id: "echo_tool" }));

    expect(registry.resolve("Echo-Tool")?.id()).toBe("echo_tool");
  });

  it("groups by category and snapshots registry", () => {
    const registry = new FoundationToolRegistry();
    registry.register(createEchoTool());
    registry.freeze();

    const snapshot = registry.snapshot("2026-07-23T00:00:00.000Z");
    expect(snapshot.toolCount).toBe(1);
    expect(snapshot.frozen).toBe(true);
    expect(snapshot.categories).toContain("utility");
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("rejects duplicate foundation tools", () => {
    const registry = new FoundationToolRegistry();
    registry.register(createEchoTool());

    expect(() => registry.register(createEchoTool())).toThrow(ToolError);
  });

  it("adapts legacy AITool into foundation resolve path", () => {
    const inner = new InMemoryToolRegistry();
    inner.register(new GetAthleteProfileTool());
    const registry = new FoundationToolRegistry(inner);

    expect(registry.resolve("get_athlete_profile")).not.toBeNull();
    expect(registry.listDescriptors()[0]?.category).toBe("domain");
  });

  it("validates registry integrity", () => {
    const registry = new FoundationToolRegistry();
    expect(validateRegistryIntegrity(registry)).toContain("empty_registry");

    registry.register(createEchoTool());
    expect(validateRegistryIntegrity(registry)).toEqual([]);
  });
});
