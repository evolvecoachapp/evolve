import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import {
  buildApplicationInfo,
  buildCapabilities,
  buildConnectivityInfo,
  buildDeviceInfo,
  buildFeatureSupport,
  buildLocaleInfo,
  buildPlatformInfo,
  buildRuntimeEnvironment,
  composeRuntimeEnvironment,
  getApplicationInfo,
  getCapabilities,
  getConnectivityInfo,
  getPlatformInfo,
  getRuntimeEnvironment,
  validateRuntimeEnvironment,
  validateRuntimeEnvironmentLatest,
} from "../index";
import {
  createMinimalRuntimeInput,
  createTestRuntimeEnvironmentService,
  FIXED_RUNTIME_TIMESTAMP,
} from "../testSupport/fixtures";

describe("Runtime Environment integration (Sprint 29.2)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("creates a complete immutable runtime environment", () => {
    const result = buildRuntimeEnvironment(createMinimalRuntimeInput());

    expect(result.success).toBe(true);
    expect(result.runtime?.id).toContain("runtime-environment:req:runtime:1");
    expect(result.runtime?.device.deviceId).toBe("device:1");
    expect(result.runtime?.platform.kind).toBe("ios");
    expect(Object.isFrozen(result.runtime)).toBe(true);
  });

  it("builds device info from explicit fields", () => {
    const device = buildDeviceInfo({
      deviceId: "device:pixel",
      model: "Pixel 8",
      manufacturer: "Google",
      osVersion: "14",
      formFactor: "phone",
    });

    expect(device.deviceId).toBe("device:pixel");
    expect(device.model).toBe("Pixel 8");
    expect(Object.isFrozen(device)).toBe(true);
  });

  it("builds platform info", () => {
    const platform = buildPlatformInfo({ kind: "android", version: "14" });

    expect(platform.kind).toBe("android");
    expect(platform.name).toBe("Android");
    expect(platform.version).toBe("14");
    expect(Object.isFrozen(platform)).toBe(true);
  });

  it("builds application info", () => {
    const application = buildApplicationInfo({
      appId: "com.evolve.app",
      name: "EVOLVE",
      version: "1.2.3",
      buildNumber: "42",
      channel: "staging",
    });

    expect(application.version).toBe("1.2.3");
    expect(application.channel).toBe("staging");
    expect(Object.isFrozen(application)).toBe(true);
  });

  it("builds capabilities as immutable descriptors", () => {
    const capabilities = buildCapabilities({
      supportsNotifications: true,
      supportsOffline: true,
      supportsBiometrics: true,
      supportsBackgroundSync: false,
      supportsHealthIntegration: false,
      supportsCamera: true,
      supportsMicrophone: false,
    });

    expect(capabilities.supportsNotifications).toBe(true);
    expect(capabilities.capabilityIds).toEqual([
      "notifications",
      "offline",
      "biometrics",
      "camera",
    ]);
    expect(Object.isFrozen(capabilities)).toBe(true);
    expect(Object.isFrozen(capabilities.capabilityIds)).toBe(true);
  });

  it("builds feature support with frozen keys", () => {
    const featureSupport = buildFeatureSupport({
      featureKeys: ["analytics", "telemetry"],
    });

    expect(featureSupport.featureKeys).toEqual(["analytics", "telemetry"]);
    expect(Object.isFrozen(featureSupport)).toBe(true);
    expect(Object.isFrozen(featureSupport.featureKeys)).toBe(true);
  });

  it("builds locale info from language tag", () => {
    const locale = buildLocaleInfo({ languageTag: "en-US" });

    expect(locale.languageTag).toBe("en-US");
    expect(locale.language).toBe("en");
    expect(locale.region).toBe("US");
    expect(Object.isFrozen(locale)).toBe(true);
  });

  it("builds connectivity model without networking", () => {
    const online = buildConnectivityInfo({ status: "online" });
    const offline = buildConnectivityInfo({ status: "offline" });
    const metered = buildConnectivityInfo({ status: "metered" });
    const unknown = buildConnectivityInfo();

    expect(online.status).toBe("online");
    expect(offline.status).toBe("offline");
    expect(metered.status).toBe("metered");
    expect(unknown.status).toBe("unknown");
    expect(Object.isFrozen(online)).toBe(true);
  });

  it("rejects missing runtime", () => {
    const validation = validateRuntimeEnvironment(null);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain("Runtime environment is missing");
  });

  it("rejects invalid platform", () => {
    const result = buildRuntimeEnvironment(
      createMinimalRuntimeInput({
        platform: {
          kind: "windows" as "ios",
          name: "Windows",
          version: "11",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) => e.includes("Invalid platform")),
    ).toBe(true);
  });

  it("rejects invalid locale", () => {
    const result = buildRuntimeEnvironment(
      createMinimalRuntimeInput({
        locale: { languageTag: "not a locale!!!" },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) => e.includes("Invalid locale")),
    ).toBe(true);
  });

  it("rejects duplicate capabilities", () => {
    const result = buildRuntimeEnvironment(
      createMinimalRuntimeInput({
        capabilities: {
          supportsNotifications: true,
          capabilityIds: Object.freeze(["notifications", "notifications"]),
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) =>
        e.includes("Duplicate capabilities"),
      ),
    ).toBe(true);
  });

  it("rejects invalid app version", () => {
    const result = buildRuntimeEnvironment(
      createMinimalRuntimeInput({
        application: {
          appId: "com.evolve.app",
          name: "EVOLVE",
          version: "not-a-version",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(
      result.validation.errors.some((e) => e.includes("Invalid app version")),
    ).toBe(true);
  });

  it("rejects missing immutable deviceId", () => {
    const result = buildRuntimeEnvironment(
      createMinimalRuntimeInput({
        device: {
          deviceId: "   ",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.validation.errors).toContain("Device deviceId is required");
  });

  it("enforces immutability on composed runtime", () => {
    const result = buildRuntimeEnvironment(createMinimalRuntimeInput());
    const runtime = result.runtime!;

    expect(Object.isFrozen(runtime)).toBe(true);
    expect(Object.isFrozen(runtime.device)).toBe(true);
    expect(Object.isFrozen(runtime.platform)).toBe(true);
    expect(Object.isFrozen(runtime.application)).toBe(true);
    expect(Object.isFrozen(runtime.capabilities)).toBe(true);
    expect(Object.isFrozen(runtime.featureSupport)).toBe(true);
    expect(Object.isFrozen(runtime.locale)).toBe(true);
    expect(Object.isFrozen(runtime.connectivity)).toBe(true);
    expect(Object.isFrozen(runtime.metadata)).toBe(true);

    const before = runtime.id;
    try {
      (runtime as { id: string }).id = "mutated";
    } catch {
      // Strict mode may throw; non-strict silently ignores.
    }
    expect(runtime.id).toBe(before);
  });

  it("registers RuntimeEnvironmentService in composition root", () => {
    const root = createCompositionRoot();

    expect(root.resolve("RuntimeEnvironmentService")).toBeDefined();
    expect(root.getRuntimeEnvironmentService()).toBe(
      root.resolve("RuntimeEnvironmentService"),
    );
  });

  it("exposes application APIs after composition", () => {
    const service = createTestRuntimeEnvironmentService();
    const composed = composeRuntimeEnvironment({
      service,
      input: createMinimalRuntimeInput({
        generatedAt: FIXED_RUNTIME_TIMESTAMP,
      }),
    });

    expect(composed.success).toBe(true);
    expect(getRuntimeEnvironment({ service })?.id).toContain(
      "runtime-environment:req:runtime:1",
    );
    expect(getCapabilities({ service })?.supportsOffline).toBe(true);
    expect(getPlatformInfo({ service })?.kind).toBe("ios");
    expect(getApplicationInfo({ service })?.version).toBe("0.6.0");
    expect(getConnectivityInfo({ service })?.status).toBe("online");
    expect(validateRuntimeEnvironmentLatest({ service }).valid).toBe(true);
  });

  it("allows replacing runtime without duplicate error", () => {
    const service = createTestRuntimeEnvironmentService();
    const first = service.build(
      createMinimalRuntimeInput({ requestId: "req:a" }),
    );
    const second = service.build(
      createMinimalRuntimeInput({ requestId: "req:b" }),
    );

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(service.getRuntimeEnvironment()?.id).toContain("req:b");
  });
});
