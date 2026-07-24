import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";

export function collectSourceAgentIds(
  state: AthleteState,
): readonly string[] {
  const ids = new Set<string>();
  for (const id of state.training.sourceAgentIds) ids.add(id);
  for (const id of state.recovery.sourceAgentIds) ids.add(id);
  for (const id of state.nutrition.sourceAgentIds) ids.add(id);
  for (const id of state.performance.sourceAgentIds) ids.add(id);
  for (const id of state.goals.sourceAgentIds) ids.add(id);
  for (const id of state.progress.sourceAgentIds) ids.add(id);
  return Object.freeze([...ids]);
}

export function contributionPaths(
  contribution: SpecialistContribution,
): readonly string[] {
  const paths: string[] = [];
  if (contribution.training) paths.push("training");
  if (contribution.recovery) paths.push("recovery");
  if (contribution.nutrition) paths.push("nutrition");
  if (contribution.performance) paths.push("performance");
  if (contribution.readiness) paths.push("readiness");
  if (contribution.fatigue) paths.push("fatigue");
  if (contribution.sleep) paths.push("sleep");
  if (contribution.stress) paths.push("stress");
  if (contribution.goals) paths.push("goals");
  if (contribution.preferences) paths.push("preferences");
  if (contribution.constraints) paths.push("constraints");
  if (contribution.progress) paths.push("progress");
  if (contribution.coaching) paths.push("coaching");
  return Object.freeze(paths);
}

export function mergeUniqueStrings(
  ...lists: readonly (readonly string[])[]
): readonly string[] {
  const set = new Set<string>();
  for (const list of lists) {
    for (const item of list) set.add(item);
  }
  return Object.freeze([...set]);
}
