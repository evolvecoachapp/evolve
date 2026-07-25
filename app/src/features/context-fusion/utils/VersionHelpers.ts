import {
  formatContextVersion,
  type ContextVersion,
} from "../models/ContextVersion";

export function isVersionNonNegative(version: ContextVersion): boolean {
  return (
    version.major >= 0 &&
    version.minor >= 0 &&
    version.patch >= 0 &&
    version.revision >= 0
  );
}

export function bumpRevision(
  version: ContextVersion,
  atLabel?: string,
): ContextVersion {
  const next = Object.freeze({
    major: version.major,
    minor: version.minor,
    patch: version.patch,
    revision: version.revision + 1,
    label: atLabel ?? formatContextVersion({
      ...version,
      revision: version.revision + 1,
    }),
  });
  return next;
}

export function compareVersions(
  a: ContextVersion,
  b: ContextVersion,
): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return a.revision - b.revision;
}
