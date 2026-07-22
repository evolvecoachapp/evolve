import {
  ApplicationContainer,
  CircularDependencyError,
  ContainerFrozenError,
  DependencyValidationError,
  DuplicateRegistrationError,
  MissingRegistrationError,
} from "../container";
import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
  resolveService,
} from "../createCompositionRoot";
import { SERVICE_TOKENS } from "../registry";

describe("Composition Root dependency validation", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("bootstraps a frozen container with all pipeline services", () => {
    const root = createCompositionRoot();
    expect(root.container.isFrozen()).toBe(true);
    for (const token of SERVICE_TOKENS) {
      expect(root.resolve(token)).toBeDefined();
    }
  });

  it("process-wide resolveService returns singletons", () => {
    const a = resolveService("ProgrammingService");
    const b = resolveService("ProgrammingService");
    expect(a).toBe(b);
    expect(getCompositionRoot().resolve("ProgrammingService")).toBe(a);
  });

  it("ProgramGenerationService reuses the same leaf services", () => {
    const root = createCompositionRoot();
    const program = root.getProgramGenerationService();
    expect(program).toBe(root.resolve("ProgramGenerationService"));
    expect(root.getProgrammingService()).toBe(
      root.resolve("ProgrammingService"),
    );
  });

  it("supports transient lifecycle when preferSingletons is false", () => {
    const root = createCompositionRoot({
      configuration: { preferSingletons: false },
    });
    const first = root.resolve("ProgrammingService");
    const second = root.resolve("ProgrammingService");
    expect(first).not.toBe(second);
  });

  it("detects missing registrations", () => {
    const container = new ApplicationContainer<{ A: number }>(["A"]);
    expect(() => container.validate()).toThrow(DependencyValidationError);
    expect(() => container.resolve("A")).toThrow(MissingRegistrationError);
  });

  it("detects duplicate registrations", () => {
    const container = new ApplicationContainer<{ A: number }>();
    container.register("A", () => 1);
    expect(() => container.register("A", () => 2)).toThrow(
      DuplicateRegistrationError,
    );
  });

  it("detects circular dependencies during resolution", () => {
    const container = new ApplicationContainer<{ A: string; B: string }>();
    container.register("A", () => `a-${container.resolve("B")}`);
    container.register("B", () => `b-${container.resolve("A")}`);
    expect(() => container.resolve("A")).toThrow(CircularDependencyError);
  });

  it("rejects late registrations after freeze", () => {
    const root = createCompositionRoot();
    expect(() =>
      root.container.register("ProgrammingService", () => {
        throw new Error("should not register");
      }),
    ).toThrow(ContainerFrozenError);
  });

  it("resetCompositionRoot clears the process singleton", () => {
    const first = getCompositionRoot();
    resetCompositionRoot();
    const second = getCompositionRoot();
    expect(second).not.toBe(first);
  });
});
