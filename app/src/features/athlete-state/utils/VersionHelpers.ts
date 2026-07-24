import {
  formatStateVersion,
  type StateVersion,
} from "../models/StateVersion";

export function bumpRevision(version: StateVersion): StateVersion {
  const next = Object.freeze({
    ...version,
    revision: version.revision + 1,
    label: "",
  });
  return Object.freeze({
    ...next,
    label: formatStateVersion(next),
  });
}

export function versionsEqual(a: StateVersion, b: StateVersion): boolean {
  return (
    a.major === b.major &&
    a.minor === b.minor &&
    a.patch === b.patch &&
    a.revision === b.revision
  );
}

export function isVersionNonNegative(version: StateVersion): boolean {
  return (
    version.major >= 0 &&
    version.minor >= 0 &&
    version.patch >= 0 &&
    version.revision >= 0
  );
}
