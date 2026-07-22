import {
  ApplicationContainer,
  CircularDependencyError,
  ContainerFrozenError,
  DependencyValidationError,
  DuplicateRegistrationError,
  InvalidResolutionError,
  MissingRegistrationError,
} from "../container";

describe("ApplicationContainer", () => {
  it("registers and resolves a service", () => {
    const container = new ApplicationContainer<{ A: { id: string } }>();
    container.register("A", () => ({ id: "a1" }));
    expect(container.resolve("A")).toEqual({ id: "a1" });
  });

  it("prevents duplicate registrations", () => {
    const container = new ApplicationContainer<{ A: number }>();
    container.register("A", () => 1);
    expect(() => container.register("A", () => 2)).toThrow(
      DuplicateRegistrationError,
    );
  });

  it("throws on missing registration", () => {
    const container = new ApplicationContainer<{ A: number }>();
    expect(() => container.resolve("A")).toThrow(MissingRegistrationError);
  });

  it("shares singleton instances", () => {
    const container = new ApplicationContainer<{ A: { n: number } }>();
    let calls = 0;
    container.register(
      "A",
      () => {
        calls += 1;
        return { n: calls };
      },
      { lifecycle: "singleton" },
    );

    const first = container.resolve("A");
    const second = container.resolve("A");
    expect(first).toBe(second);
    expect(calls).toBe(1);
  });

  it("creates a new instance for transient lifecycle", () => {
    const container = new ApplicationContainer<{ A: { n: number } }>();
    let calls = 0;
    container.register(
      "A",
      () => {
        calls += 1;
        return { n: calls };
      },
      { lifecycle: "transient" },
    );

    const first = container.resolve("A");
    const second = container.resolve("A");
    expect(first).not.toBe(second);
    expect(first.n).toBe(1);
    expect(second.n).toBe(2);
    expect(calls).toBe(2);
  });

  it("detects circular dependencies", () => {
    const container = new ApplicationContainer<{ A: string; B: string }>();
    container.register("A", () => container.resolve("B"));
    container.register("B", () => container.resolve("A"));
    expect(() => container.resolve("A")).toThrow(CircularDependencyError);
  });

  it("rejects late registration after freeze", () => {
    const container = new ApplicationContainer<{ A: number; B: number }>();
    container.register("A", () => 1);
    container.freeze();
    expect(container.isFrozen()).toBe(true);
    expect(() => container.register("B", () => 2)).toThrow(ContainerFrozenError);
  });

  it("validate fails when required tokens are missing", () => {
    const container = new ApplicationContainer<{ A: number; B: number }>([
      "A",
      "B",
    ]);
    container.register("A", () => 1);
    expect(() => container.validate()).toThrow(DependencyValidationError);
  });

  it("validate eagerly resolves required tokens", () => {
    const container = new ApplicationContainer<{ A: number }>(["A"]);
    container.register("A", () => 42);
    container.validate();
    expect(container.resolve("A")).toBe(42);
  });

  it("rejects null factory results", () => {
    const container = new ApplicationContainer<{ A: object }>();
    container.register("A", () => null as unknown as object);
    expect(() => container.resolve("A")).toThrow(InvalidResolutionError);
  });

  it("clearSingletons forces singleton recreation", () => {
    const container = new ApplicationContainer<{ A: { n: number } }>();
    let calls = 0;
    container.register("A", () => {
      calls += 1;
      return { n: calls };
    });
    container.resolve("A");
    container.clearSingletons();
    container.resolve("A");
    expect(calls).toBe(2);
  });
});
