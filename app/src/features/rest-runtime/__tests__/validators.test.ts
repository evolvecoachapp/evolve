import { DEFAULT_REST_CONFIGURATION } from "../models/RestConfiguration";
import { createRestDuration } from "../models/RestDuration";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";
import {
  validateConfigurationDurations,
  validateDurationMs,
  validateElapsedUpdate,
  validateRestExpiration,
  validateSessionDurations,
} from "../validators";
import { RestRuntimeBuilder } from "../builders";

describe("rest-runtime validators", () => {
  it("rejects negative and non-finite durations", () => {
    expect(validateDurationMs(-1)).toEqual(["negative_duration:-1"]);
    expect(validateDurationMs(Number.NaN)[0]).toMatch(/non_finite_duration/);
    expect(validateDurationMs(10_000)).toEqual([]);
  });

  it("rejects elapsed regression", () => {
    expect(validateElapsedUpdate(20_000, 10_000)).toEqual([
      "elapsed_regression:20000->10000",
    ]);
    expect(validateElapsedUpdate(10_000, 10_000)).toEqual([]);
  });

  it("rejects zero target configuration", () => {
    expect(
      validateConfigurationDurations({
        ...DEFAULT_REST_CONFIGURATION,
        targetDurationMs: 0,
      }),
    ).toContain("zero_target_duration");
  });

  it("detects session/config target mismatch", () => {
    const session = createMinimalRestSession({ targetDurationMs: 60_000 });
    const issues = validateSessionDurations(session, {
      ...DEFAULT_REST_CONFIGURATION,
      targetDurationMs: 90_000,
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    expect(issues.some((issue) => issue.startsWith("target_mismatch"))).toBe(
      true,
    );
  });

  it("requires target reached before expiration", () => {
    const runtime = new RestRuntimeBuilder().build({
      session: createMinimalRestSession({ targetDurationMs: 60_000 }),
      state: "Running",
      configuration: { fixedTimestamp: FIXED_TIMESTAMP },
    });
    expect(validateRestExpiration(runtime)[0]).toMatch(/target_not_reached/);
  });

  it("rejects negative RestDuration construction", () => {
    expect(() => createRestDuration(-5)).toThrow(/invalid_duration/);
  });
});
