import { loadProfile, type LoadProfileDeps } from "./LoadProfile";

export async function refreshProfile(deps: LoadProfileDeps = {}) {
  return loadProfile(deps);
}
