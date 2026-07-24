import type { StateVersion } from "../models/StateVersion";
import { bumpRevision } from "../utils/VersionHelpers";

export class VersionManager {
  next(version: StateVersion): StateVersion {
    return bumpRevision(version);
  }
}

export function createVersionManager(): VersionManager {
  return new VersionManager();
}
