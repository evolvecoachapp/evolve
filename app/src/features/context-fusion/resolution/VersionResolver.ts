import { INITIAL_CONTEXT_VERSION, type ContextVersion } from "../models/ContextVersion";
import { bumpRevision, compareVersions } from "../utils/VersionHelpers";
import { freezeVersion } from "../utils/FreezeContext";

export function resolveVersion(input: {
  readonly current: ContextVersion | null;
  readonly contributionVersions: readonly (ContextVersion | null)[];
  readonly bump: boolean;
}): ContextVersion {
  let base = input.current ?? INITIAL_CONTEXT_VERSION;
  for (const v of input.contributionVersions) {
    if (v && compareVersions(v, base) > 0) {
      base = v;
    }
  }
  const next = input.bump ? bumpRevision(base) : base;
  return freezeVersion({
    ...next,
    label: `${next.major}.${next.minor}.${next.patch}+${next.revision}`,
  });
}
