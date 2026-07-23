import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";

/**
 * Deterministic dependency helpers for Tool Runtime orchestration.
 */

export function stepsMissingDependencies(
  steps: readonly ToolExecutionStep[],
): readonly ToolExecutionStep[] {
  const ids = new Set(steps.map((s) => s.id));
  return Object.freeze(
    steps.filter((step) =>
      step.dependsOn.some((depId) => !ids.has(depId)),
    ),
  );
}

export function hasCircularDependencies(
  steps: readonly ToolExecutionStep[],
): boolean {
  const graph = new Map<string, readonly string[]>();
  for (const step of steps) {
    graph.set(step.id, step.dependsOn);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function dfs(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dep of graph.get(id) ?? []) {
      if (dfs(dep)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  for (const id of graph.keys()) {
    if (dfs(id)) return true;
  }
  return false;
}

/**
 * Topological order of execution step ids (stable by order then id).
 */
export function topologicalStepOrder(
  steps: readonly ToolExecutionStep[],
): readonly string[] {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const step of steps) {
    indegree.set(step.id, step.dependsOn.length);
    for (const dep of step.dependsOn) {
      const list = dependents.get(dep) ?? [];
      list.push(step.id);
      dependents.set(dep, list);
    }
  }

  const ready = steps
    .filter((s) => (indegree.get(s.id) ?? 0) === 0)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((s) => s.id);

  const result: string[] = [];
  while (ready.length > 0) {
    const id = ready.shift()!;
    result.push(id);
    for (const child of dependents.get(id) ?? []) {
      const next = (indegree.get(child) ?? 0) - 1;
      indegree.set(child, next);
      if (next === 0) {
        const step = byId.get(child);
        if (step) {
          ready.push(child);
          ready.sort((a, b) => {
            const sa = byId.get(a)!;
            const sb = byId.get(b)!;
            return sa.order - sb.order || sa.id.localeCompare(sb.id);
          });
        }
      }
    }
  }

  return Object.freeze(result);
}

export function countDependencies(plan: ToolExecutionPlan): number {
  return plan.steps.reduce((sum, step) => sum + step.dependsOn.length, 0);
}
