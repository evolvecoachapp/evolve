/**
 * Deep structural comparison for golden snapshots.
 * Returns an empty array when equal; otherwise human-readable diff paths.
 */
export function compareSnapshots(
  actual: unknown,
  expected: unknown,
  path = "$",
): readonly string[] {
  const issues: string[] = [];

  if (Object.is(actual, expected)) {
    return issues;
  }

  if (actual === null || expected === null || actual === undefined || expected === undefined) {
    if (actual !== expected) {
      issues.push(`${path}: expected ${stringify(expected)}, got ${stringify(actual)}`);
    }
    return issues;
  }

  if (typeof actual !== typeof expected) {
    issues.push(
      `${path}: type mismatch expected ${typeof expected}, got ${typeof actual}`,
    );
    return issues;
  }

  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      issues.push(`${path}: array mismatch`);
      return issues;
    }
    if (actual.length !== expected.length) {
      issues.push(
        `${path}: array length expected ${expected.length}, got ${actual.length}`,
      );
    }
    const len = Math.min(actual.length, expected.length);
    for (let i = 0; i < len; i += 1) {
      issues.push(...compareSnapshots(actual[i], expected[i], `${path}[${i}]`));
    }
    return issues;
  }

  if (typeof actual === "object" && typeof expected === "object") {
    const actualKeys = Object.keys(actual as object).sort();
    const expectedKeys = Object.keys(expected as object).sort();
    if (actualKeys.join("\0") !== expectedKeys.join("\0")) {
      issues.push(
        `${path}: keys expected [${expectedKeys.join(", ")}], got [${actualKeys.join(", ")}]`,
      );
    }
    for (const key of expectedKeys) {
      issues.push(
        ...compareSnapshots(
          (actual as Record<string, unknown>)[key],
          (expected as Record<string, unknown>)[key],
          `${path}.${key}`,
        ),
      );
    }
    return issues;
  }

  if (actual !== expected) {
    issues.push(`${path}: expected ${stringify(expected)}, got ${stringify(actual)}`);
  }
  return issues;
}

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function assertSnapshotsEqual(
  actual: unknown,
  expected: unknown,
  label = "snapshot",
): void {
  const issues = compareSnapshots(actual, expected);
  expect(issues).toEqual([]);
  if (issues.length > 0) {
    throw new Error(`${label} mismatch:\n${issues.join("\n")}`);
  }
}
